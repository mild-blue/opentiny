import { Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import * as Options from '../api/Options';
import { verticalAlignValues } from './CellAlignValues';
import * as UiUtils from './UiUtils';

const getClassList = (editor: Editor): Optional<Dialog.ListBoxSpec> =>
  UiUtils.buildClassList(Options.getCellClassList(editor))
    .map((items) => ({
      name: 'class',
      type: 'listbox',
      label: 'Class',
      items
    }));

const children: Dialog.BodyComponentSpec[] = [
  {
    name: 'width',
    type: 'input',
    label: 'Width'
  },
  {
    name: 'celltype',
    type: 'listbox',
    label: 'Cell type',
    items: [
      { text: 'Cell', value: 'td' },
      { text: 'Header cell', value: 'th' }
    ]
  },
  {
    name: 'scope',
    type: 'listbox',
    label: 'Scope',
    items: [
      { text: 'None', value: '' },
      { text: 'Row', value: 'row' },
      { text: 'Column', value: 'col' },
      { text: 'Row group', value: 'rowgroup' },
      { text: 'Column group', value: 'colgroup' }
    ]
  },
  {
    name: 'halign',
    type: 'listbox',
    label: 'Horizontal align',
    items: [
      { text: 'None', value: '' },
      { text: 'Left', value: 'left' },
      { text: 'Center', value: 'center' },
      { text: 'Right', value: 'right' }
    ]
  },
  {
    name: 'valign',
    type: 'listbox',
    label: 'Vertical align',
    items: verticalAlignValues
  }
];

const getItems = (editor: Editor): Dialog.BodyComponentSpec[] => {
  const inputs = Options.getTableCellInputs(editor).split(" ");
  const allItems = children.concat(getClassList(editor).toArray());
  const filteredItems = allItems.filter((item) => 'name' in item && inputs.includes(item.name));
  return filteredItems.sort((a, b) => {
    const nameA = 'name' in a ? a.name : '';
    const nameB = 'name' in b ? b.name : '';
    return inputs.indexOf(nameA) - inputs.indexOf(nameB);
  });
}

export {
  getItems
};
