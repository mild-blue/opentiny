import Editor from 'tinymce/core/api/Editor';

import * as Checkbox from './Checkbox';

const isFollowedByWhitespace = (editor: Editor): boolean => {
  const rng = editor.selection.getRng();
  const container = rng.endContainer;
  return rng.collapsed && container.nodeType === Node.TEXT_NODE && /^[ \u00a0]/.test((container as Text).data.slice(rng.endOffset));
};

const insertCheckbox = (editor: Editor): void => {
  // The space separates the checkbox from its label, so don't add a second one
  const space = isFollowedByWhitespace(editor) ? '' : '&nbsp;';
  editor.insertContent(`<span class="${Checkbox.checkboxClass}">${Checkbox.uncheckedGlyph}</span>${space}`);
};

const toggleCheckbox = (editor: Editor, checkbox: HTMLElement): void => {
  editor.undoManager.transact(() => {
    checkbox.textContent = Checkbox.getToggledGlyph(checkbox.textContent ?? '');
  });
};

export {
  insertCheckbox,
  toggleCheckbox
};
