import Editor from 'tinymce/core/api/Editor';

import * as Actions from '../core/Actions';

const register = (editor: Editor): void => {
  editor.addCommand('mceInsertCheckbox', () => Actions.insertCheckbox(editor));
  editor.addCommand('mceToggleCheckbox', () => {
    Actions.toggleSelectedCheckbox(editor);
  });
};

export {
  register
};
