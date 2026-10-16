import Editor from 'tinymce/core/api/Editor';
import { Menu, Toolbar } from 'tinymce/core/api/ui/Ui';

import * as Checklist from '../core/Checklist';

const onSetupEditable = (editor: Editor) => (api: Toolbar.ToolbarButtonInstanceApi | Menu.MenuItemInstanceApi): VoidFunction => {
  const nodeChanged = () => {
    api.setEnabled(editor.selection.isEditable());
  };

  editor.on('NodeChange', nodeChanged);
  nodeChanged();

  return () => {
    editor.off('NodeChange', nodeChanged);
  };
};

const onSetupChecklist = (editor: Editor) => (api: Toolbar.ToolbarToggleButtonInstanceApi | Menu.ToggleMenuItemInstanceApi): VoidFunction => {
  const nodeChanged = () => {
    api.setActive(Checklist.isInChecklist(editor));
    api.setEnabled(editor.selection.isEditable());
  };

  editor.on('NodeChange', nodeChanged);
  nodeChanged();

  return () => {
    editor.off('NodeChange', nodeChanged);
  };
};

const registerChecklist = (editor: Editor): void => {
  const onAction = () => editor.execCommand('mceToggleChecklist');

  editor.ui.registry.addToggleButton('checklist', {
    icon: 'checklist',
    tooltip: 'Checklist',
    onAction,
    onSetup: onSetupChecklist(editor)
  });

  editor.ui.registry.addToggleMenuItem('checklist', {
    text: 'Checklist',
    icon: 'checklist',
    onAction,
    onSetup: onSetupChecklist(editor)
  });
};

const register = (editor: Editor): void => {
  const onAction = () => editor.execCommand('mceInsertCheckbox');

  editor.ui.registry.addButton('checkbox', {
    icon: 'checkbox',
    tooltip: 'Insert checkbox',
    onAction,
    onSetup: onSetupEditable(editor)
  });

  editor.ui.registry.addMenuItem('checkbox', {
    text: 'Checkbox',
    icon: 'checkbox',
    onAction,
    onSetup: onSetupEditable(editor)
  });

  // Checklists are built with the list commands of the lists plugin
  if (editor.hasPlugin('lists')) {
    registerChecklist(editor);
  }
};

export {
  register
};
