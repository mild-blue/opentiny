import Editor from 'tinymce/core/api/Editor';
import VK from 'tinymce/core/api/util/VK';

import * as Actions from './Actions';

const setup = (editor: Editor): void => {
  editor.on('keydown', (e) => {
    if (e.keyCode === VK.SPACEBAR && !VK.modifierPressed(e) && !e.isDefaultPrevented() && Actions.toggleSelectedCheckbox(editor)) {
      e.preventDefault();
    }
  });
};

export {
  setup
};
