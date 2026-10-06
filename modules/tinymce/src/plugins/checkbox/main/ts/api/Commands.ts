import Editor from 'tinymce/core/api/Editor';

import * as Actions from '../core/Actions';
import * as Checklist from '../core/Checklist';

const register = (editor: Editor): void => {
  editor.addCommand('mceInsertCheckbox', () => Actions.insertCheckbox(editor));
  editor.addCommand('mceToggleCheckbox', () => {
    Actions.toggleSelectedCheckbox(editor);
  });

  // Checklists are built with the list commands of the lists plugin
  if (editor.hasPlugin('lists')) {
    editor.addCommand('mceToggleChecklist', () => Checklist.toggleChecklist(editor));
  }
};

export {
  register
};
