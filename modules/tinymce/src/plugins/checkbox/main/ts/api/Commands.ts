import Editor from 'tinymce/core/api/Editor';

import * as Actions from '../core/Actions';

const register = (editor: Editor): void => {
  editor.addCommand('mceInsertCheckbox', () => Actions.insertCheckbox(editor));
};

export {
  register
};
