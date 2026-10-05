import { Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Actions from './Actions';
import * as Checkbox from './Checkbox';

const isCheckboxElement = (editor: Editor, node: Node): node is HTMLElement =>
  editor.dom.is(node, `span.${Checkbox.checkboxClass}`) && Checkbox.isGlyph(node.textContent ?? '');

const getToggleableCheckbox = (editor: Editor, target: EventTarget | null): Optional<HTMLElement> =>
  Optional.from(target as Node | null)
    .filter((node): node is HTMLElement => isCheckboxElement(editor, node) && editor.getBody().contains(node))
    .filter((checkbox) => !editor.mode.isReadOnly() && editor.dom.isEditable(checkbox.parentNode));

const setup = (editor: Editor): void => {
  // Bound on PreInit and prepended so these run before the core contenteditable="false" handlers
  // (SelectionOverrides), which would otherwise select the span or show a fake caret next to it.
  editor.on('PreInit', () => {
    editor.on('mousedown', (e) => {
      if (e.button === 0) {
        getToggleableCheckbox(editor, e.target).each(() => {
          // Keep the caret where it was
          e.preventDefault();
          e.stopImmediatePropagation();
        });
      }
    }, true);

    // Not prevented, so the browser still synthesizes the click that toggles the checkbox
    editor.on('tap', (e) => {
      getToggleableCheckbox(editor, e.target).each(() => e.stopImmediatePropagation());
    }, true);

    editor.on('click', (e) => {
      getToggleableCheckbox(editor, e.target).each((checkbox) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        Actions.toggleCheckbox(editor, checkbox);
      });
    }, true);
  });
};

export {
  setup
};
