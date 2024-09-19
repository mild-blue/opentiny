import { Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import * as Options from '../api/Options';
import * as UiUtils from './UiUtils';

const getClassList = (editor: Editor): Optional<Dialog.ListBoxSpec> =>
  UiUtils.buildClassList(Options.getRowClassList(editor))
    .map((items) => ({
      name: 'class',
      type: 'listbox',
      label: 'Class',
      items
    }));

const formChildren: Dialog.BodyComponentSpec[] = [
  {
    type: 'listbox',
    name: 'type',
    label: 'Row type',
    tooltip: 'Select the type of row to apply formatting or styling to.',
    items: [
      { text: 'Header', value: 'header' },
      { text: 'Body', value: 'body' },
      { text: 'Footer', value: 'footer' }
    ]
  },
  {
    type: 'listbox',
    name: 'align',
    label: 'Alignment',
    tooltip: 'Alignment of the content within the cells in the row.',
    items: [
      { text: 'None', value: '' },
      { text: 'Left', value: 'left' },
      { text: 'Center', value: 'center' },
      { text: 'Right', value: 'right' }
    ]
  },
  {
    label: 'Height',
    name: 'height',
    type: 'input',
    tooltip: 'Row height in pixels (e.g., 20px).'
  }
];

const getItems = (editor: Editor): Dialog.BodyComponentSpec[] => {
  const inputs = Options.getTableRowInputs(editor).split(' ');
  const allItems = formChildren.concat(getClassList(editor).toArray());
  const filteredItems = allItems.filter((item) => 'name' in item && inputs.includes(item.name));
  return filteredItems.sort((a, b) => {
    const nameA = 'name' in a ? a.name : '';
    const nameB = 'name' in b ? b.name : '';
    return inputs.indexOf(nameA) - inputs.indexOf(nameB);
  });
};

export {
  getItems
};
