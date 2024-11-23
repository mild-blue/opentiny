import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import * as Options from '../api/Options';
import { buildListItems } from './UiUtils';

type DialogName = 'table' | 'row' | 'cell';

const getBorderStyleTooltip = (dialogName: DialogName): string => `Style of the outer border of the ${dialogName}.`;

const getBorderColorTooltip = (dialogName: DialogName): string => {
  switch (dialogName) {
    case 'table':
      return 'Color of the border for the entire table and individual cells.';
    case 'row':
    case 'cell':
      return `Color of the outer border of the ${dialogName}.`;
  }
};

const getBackgroundColourTooltip = (dialogName: DialogName): string => {
  switch (dialogName) {
    case 'table':
      return 'Changes the background color of all cells in the table, except for those set individually through Cell Properties or Row Properties.';
    case 'row':
      return 'Changes the background color of all cells in the row, except for those set individually through Cell Properties.';
    case 'cell':
      return `Background color of the cell.`;
  }
};

const getBorderWidthTooltip = (dialogName: DialogName): string | undefined => {
  switch (dialogName) {
    case 'table':
    case 'row':
      return undefined;
    case 'cell':
      return 'Width of the outer border of the cell.';
  }
};

const getAdvancedTab = (editor: Editor, dialogName: DialogName): Dialog.TabSpec => {
  const emptyBorderStyle: Dialog.ListBoxItemSpec[] = [{text: 'None', value: 'none'}];

  const isDefinedDefaultBorderStyle = Options.getDefaultStyles(editor)["border-style"];
  const optionsContainNone = Options.getTableBorderStyles(editor).some((item) => item.value === 'none');

  const advTabItems: Dialog.BodyComponentSpec[] = [
    {
      name: 'borderstyle',
      type: 'listbox',
      label: 'Border style',
      tooltip: getBorderStyleTooltip(dialogName),
      // in case user forgets to define an option for a table without border style and doesn't set default border style,
      // we need to add it as none option
      items: (!isDefinedDefaultBorderStyle && !optionsContainNone ? emptyBorderStyle : []).concat(buildListItems(Options.getTableBorderStyles(editor)))
    },
    {
      name: 'bordercolor',
      type: 'colorinput',
      label: 'Border color',
      tooltip: getBorderColorTooltip(dialogName)
    },
    {
      name: 'backgroundcolor',
      type: 'colorinput',
      label: 'Background color',
      tooltip: getBackgroundColourTooltip(dialogName)
    }
  ];

  const borderWidth: Dialog.InputSpec = {
    name: 'borderwidth',
    type: 'input',
    label: 'Border width',
    tooltip: getBorderWidthTooltip(dialogName)
  };

  const items = dialogName === 'cell' ? ([ borderWidth ] as Dialog.BodyComponentSpec[]).concat(advTabItems) : advTabItems;

  return {
    title: 'Advanced',
    name: 'advanced',
    items
  };
};

export {
  getAdvancedTab
};
