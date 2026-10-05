import { Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Actions from './Actions';
import * as Checkbox from './Checkbox';

const isCheckboxElement = (editor: Editor, node: Node): node is HTMLElement =>
  editor.dom.is(node, `span.${Checkbox.checkboxClass}`) && node.childNodes.length === 1 &&
  node.firstChild?.nodeType === Node.TEXT_NODE && Checkbox.isGlyph(node.textContent ?? '');

const getToggleableCheckbox = (editor: Editor, target: EventTarget | null): Optional<HTMLElement> =>
  Optional.from(target as Node | null)
    .filter((node): node is HTMLElement => isCheckboxElement(editor, node) && editor.getBody().contains(node))
    .filter((checkbox) => !editor.mode.isReadOnly() && editor.dom.isEditable(checkbox.parentNode));

const hasModifierKey = (e: MouseEvent): boolean =>
  e.ctrlKey || e.metaKey || e.shiftKey || e.altKey;

const setup = (editor: Editor): void => {
  // The checkbox being clicked or tapped. Only the pointer selection of it is suppressed,
  // keyboard navigation can still select it.
  let pointerCheckbox: HTMLElement | null = null;

  editor.on('mousedown touchstart', (e) => {
    pointerCheckbox = getToggleableCheckbox(editor, e.target).getOrNull();
  }, true);

  editor.on('keydown', () => {
    pointerCheckbox = null;
  });

  // Core selects a clicked contenteditable="false" element. Don't, so the caret stays where it was.
  editor.on('BeforeObjectSelected', (e) => {
    if (e.target === pointerCheckbox) {
      e.preventDefault();
    }
  });

  // Core's own click handler then focuses the editor, so undo applies to this editor
  editor.on('click', (e) => {
    pointerCheckbox = null;
    if (!hasModifierKey(e)) {
      getToggleableCheckbox(editor, e.target).each((checkbox) => {
        e.preventDefault();
        Actions.toggleCheckbox(editor, checkbox);
      });
    }
  });

  // Core cancels touchend on a contenteditable="false" element, so no click follows a tap
  editor.on('tap', (e) => {
    pointerCheckbox = null;
    getToggleableCheckbox(editor, e.target).each((checkbox) => {
      e.preventDefault();
      Actions.toggleCheckbox(editor, checkbox);
    });
  });
};

export {
  setup
};
