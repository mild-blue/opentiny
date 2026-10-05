import Editor from 'tinymce/core/api/Editor';

import * as Checkbox from './Checkbox';

const insertCheckbox = (editor: Editor): void => {
  editor.insertContent(`<span class="${Checkbox.checkboxClass}">${Checkbox.uncheckedGlyph}</span>&nbsp;`);
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
