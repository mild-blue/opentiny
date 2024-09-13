import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import * as Options from '../api/Options';

const getItems = (editor: Editor, classes: Dialog.ListBoxItemSpec[], insertNewTable: boolean): Dialog.BodyComponentSpec[] => {
  const rowColCountItems: Dialog.BodyComponentSpec[] = !insertNewTable ? [] : [
    {
      type: 'input',
      name: 'cols',
      label: 'Cols',
      inputMode: 'numeric'
    },
    {
      type: 'input',
      name: 'rows',
      label: 'Rows',
      inputMode: 'numeric'
    }
  ];

  const tableSettingsItems: Dialog.BodyComponentSpec[] = [
    {
      type: 'input',
      name: 'width',
      label: 'Width',
      tooltip: 'Total width of the table in pixels or percentage (e.g., 500px or 100%).'
    },
    {
      type: 'input',
      name: 'height',
      label: 'Height',
      tooltip: 'Total height of the table in pixels (e.g., 500px).'
    },
    {
      type: 'input',
      name: 'cellspacing',
      label: 'Cell spacing',
      inputMode: 'numeric',
      tooltip: 'The space between individual table cells, measured in pixels (e.g., 5px).'
    },
    {
      type: 'input',
      name: 'cellpadding',
      label: 'Cell padding',
      inputMode: 'numeric',
      tooltip: 'Inner text padding in cells, e.g., 0px 5px (where 0px is vertical padding, and 5px is horizontal padding).'
    },
    {
      type: 'input',
      name: 'border',
      label: 'Border width',
      tooltip: 'Width of the border for the entire table and individual cells.'
    },
    {
      type: 'label',
      label: 'Caption',
      name: 'caption',
      tooltip: 'Adds a caption above the table, which can be edited.',
      items: [
        {
          type: 'checkbox',
          name: 'caption',
          label: 'Show caption'
        }
      ]
    },
    {
      type: 'listbox',
      name: 'align',
      label: 'Alignment',
      tooltip: 'Alignment of the entire table (not the content within the table).',
      items: [
        { text: 'None', value: '' },
        { text: 'Left', value: 'left' },
        { text: 'Center', value: 'center' },
        { text: 'Right', value: 'right' }
      ]
    }
  ];

  if (classes.length > 0) {
    tableSettingsItems.push({
      name: 'class',
      type: 'listbox',
      label: 'Class',
      items: classes
    });
  }

  const inputs = Options.getTableInputs(editor).split(' ');
  const filteredTableSettingsItems = tableSettingsItems.filter((item) => 'name' in item && inputs.includes(item.name));
  const sortedItems = filteredTableSettingsItems.sort((a, b) => {
    const nameA = 'name' in a ? a.name : '';
    const nameB = 'name' in b ? b.name : '';
    return inputs.indexOf(nameA) - inputs.indexOf(nameB);
  });
  return rowColCountItems.concat(sortedItems);
};

export { getItems };
