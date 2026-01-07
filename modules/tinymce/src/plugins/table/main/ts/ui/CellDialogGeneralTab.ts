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
    label: 'Width',
    tooltip: 'Cell width in pixels or percentage (e.g., 50px or 10%).'
  },
  {
    name: 'height',
    type: 'input',
    label: 'Height',
    tooltip: 'Row height in pixels (e.g., 20px).'
  },
  {
    name: 'celltype',
    type: 'listbox',
    label: 'Cell type',
    tooltip: 'Select the type of cell to apply formatting or styling to.',
    items: [
      { text: 'Cell', value: 'td' },
      { text: 'Header cell', value: 'th' }
    ]
  },
  {
    name: 'scope',
    type: 'listbox',
    label: 'Scope',
    tooltip: 'Defines the scope of the header cell to specify its relationship to rows or columns.',
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
    tooltip: 'Horizontal alignment of the cell content.',
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
    tooltip: 'Vertical alignment of the cell content.',
    items: verticalAlignValues
  }
];

const getItems = (editor: Editor): Dialog.BodyComponentSpec[] => {
  const inputs = Options.getTableCellInputs(editor).split(' ');
  const allItems = children.concat(getClassList(editor).toArray());
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
