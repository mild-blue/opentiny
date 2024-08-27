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
      label: 'Width'
    },
    {
      type: 'input',
      name: 'height',
      label: 'Height'
    },
    {
      type: 'input',
      name: 'cellspacing',
      label: 'Cell spacing',
      inputMode: 'numeric'
    },
    {
      type: 'input',
      name: 'cellpadding',
      label: 'Cell padding',
      inputMode: 'numeric'
    },
    {
      type: 'input',
      name: 'border',
      label: 'Border width'
    },
    {
      type: 'label',
      label: 'Caption',
      name: 'caption',
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
    })
  }

  const inputs = Options.getTableInputs(editor).split(" ");
  const filteredTableSettingsItems = tableSettingsItems.filter((item) => inputs.includes(item.name))
  const sortedItems = filteredTableSettingsItems.sort((a, b) => 
    inputs.indexOf(a.name) - inputs.indexOf(b.name)
  );
  return rowColCountItems.concat(sortedItems);
};

export { getItems };
