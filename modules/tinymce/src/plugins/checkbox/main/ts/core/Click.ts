import { Arr, Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Actions from './Actions';
import * as Checkbox from './Checkbox';

const hasModifierKey = (e: MouseEvent): boolean =>
  e.ctrlKey || e.metaKey || e.shiftKey || e.altKey;

// Core's caret containers next to a contenteditable="false" element are zero width no-break spaces
const isCaretContainerText = (node: Node): boolean =>
  node.nodeType === Node.TEXT_NODE && /^\uFEFF*$/.test((node as Text).data);

const getSpaceAfter = (checkbox: HTMLElement): Optional<Text> => {
  let next = checkbox.nextSibling;
  while (next && isCaretContainerText(next)) {
    next = next.nextSibling;
  }
  return Optional.from(next).filter((node): node is Text => node.nodeType === Node.TEXT_NODE && /^[ \u00a0]/.test((node as Text).data));
};

// A click on a checkbox, or next to it, can leave the caret between the checkbox and the space after it, so typed
// text would stick to the checkbox. Move such a caret past the space.
const moveCaretPastSpace = (editor: Editor): void => {
  const rng = editor.selection.getRng();
  const block = editor.dom.getParent(rng.startContainer, (node) => editor.dom.isBlock(node));
  if (!rng.collapsed || !block) {
    return;
  }
  Arr.each(editor.dom.select<HTMLElement>(`span.${Checkbox.checkboxClass}`, block), (checkbox) => {
    getSpaceAfter(checkbox).each((space) => {
      const afterCheckbox = editor.dom.createRng();
      afterCheckbox.setStartAfter(checkbox);
      const afterSpace = editor.dom.createRng();
      afterSpace.setStart(space, 1);
      if (rng.compareBoundaryPoints(rng.START_TO_START, afterCheckbox) >= 0 && rng.compareBoundaryPoints(rng.START_TO_START, afterSpace) < 0) {
        editor.selection.setCursorLocation(space, 1);
      }
    });
  });
};

const setup = (editor: Editor): void => {
  // The checkbox being clicked. Only a plain left click is handled, anything else (a right click for the context
  // menu, a click with a modifier key) keeps the core behaviour of selecting the checkbox.
  let pointerCheckbox: HTMLElement | null = null;

  editor.on('mousedown', (e) => {
    pointerCheckbox = e.button === 0 && !hasModifierKey(e) ? Actions.getToggleableCheckbox(editor, e.target).getOrNull() : null;
  }, true);

  editor.on('keydown', () => {
    pointerCheckbox = null;
  });

  // Core selects a clicked contenteditable="false" element. Put the caret after the checkbox instead, as a click on
  // text would, so whatever acts on the selection next (Delete, a triple click, table actions) acts here.
  editor.on('BeforeObjectSelected', (e) => {
    if (e.target === pointerCheckbox) {
      e.preventDefault();
      const rng = editor.dom.createRng();
      rng.setStartAfter(e.target);
      rng.collapse(true);
      editor.selection.setRng(rng);
    }
  });

  // A click that drifts a few pixels would otherwise start dragging the checkbox to another place
  editor.on('dragstart', (e) => {
    if (e.target === pointerCheckbox) {
      e.preventDefault();
    }
  });

  // Core's own click handler then focuses the editor, so undo applies to this editor
  editor.on('click', (e) => {
    pointerCheckbox = null;
    if (!hasModifierKey(e)) {
      Actions.getToggleableCheckbox(editor, e.target).each((checkbox) => {
        e.preventDefault();
        Actions.toggleCheckbox(editor, checkbox);
      });
    }
    moveCaretPastSpace(editor);
  });
};

export {
  setup
};
