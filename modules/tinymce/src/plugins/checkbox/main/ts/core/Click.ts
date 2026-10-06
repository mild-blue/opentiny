import Editor from 'tinymce/core/api/Editor';

import * as Actions from './Actions';

const hasModifierKey = (e: MouseEvent): boolean =>
  e.ctrlKey || e.metaKey || e.shiftKey || e.altKey;

const setup = (editor: Editor): void => {
  // The checkbox being clicked or tapped. Only a plain left click or a tap is handled, anything else (a right click
  // for the context menu, a click with a modifier key) keeps the core behaviour of selecting the checkbox.
  let pointerCheckbox: HTMLElement | null = null;

  editor.on('mousedown', (e) => {
    pointerCheckbox = e.button === 0 && !hasModifierKey(e) ? Actions.getToggleableCheckbox(editor, e.target).getOrNull() : null;
  }, true);

  editor.on('touchstart', (e) => {
    pointerCheckbox = Actions.getToggleableCheckbox(editor, e.target).getOrNull();
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
  });

  // Core cancels touchend on a contenteditable="false" element, so no click follows a tap
  editor.on('tap', (e) => {
    pointerCheckbox = null;
    Actions.getToggleableCheckbox(editor, e.target).each((checkbox) => {
      e.preventDefault();
      Actions.toggleCheckbox(editor, checkbox);
    });
  });
};

export {
  setup
};
