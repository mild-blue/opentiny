import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Checklist from './core/Checklist';
import * as Click from './core/Click';
import * as FilterContent from './core/FilterContent';
import * as Buttons from './ui/Buttons';

export default (): void => {
  PluginManager.add('checkbox', (editor) => {
    Commands.register(editor);
    Buttons.register(editor);
    FilterContent.setup(editor);
    Click.setup(editor);
    Checklist.setup(editor);

    return {
      getMetadata: () => ({
        name: 'Checkbox',
        url: 'https://github.com/mild-blue/opentiny/tree/main/modules/tinymce/src/plugins/checkbox'
      })
    };
  });
};
