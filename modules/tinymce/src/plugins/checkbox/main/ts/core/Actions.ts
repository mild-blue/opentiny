import { Fun, Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Checkbox from './Checkbox';

const isCheckboxElement = (editor: Editor, node: Node): node is HTMLElement =>
  editor.dom.is(node, `span.${Checkbox.checkboxClass}`) && node.childNodes.length === 1 &&
  node.firstChild?.nodeType === Node.TEXT_NODE && Checkbox.isGlyph(node.textContent ?? '');

const getToggleableCheckbox = (editor: Editor, target: EventTarget | null): Optional<HTMLElement> =>
  Optional.from(target as Node | null)
    .filter((node): node is HTMLElement => isCheckboxElement(editor, node) && editor.getBody().contains(node))
    .filter((checkbox) => !editor.mode.isReadOnly() && editor.dom.isEditable(checkbox.parentNode));

// Arrow keys select a checkbox like any other contenteditable="false" element
const getSelectedCheckbox = (editor: Editor): Optional<HTMLElement> =>
  editor.selection.isCollapsed() ? Optional.none() : getToggleableCheckbox(editor, editor.selection.getNode());

const isFollowedByWhitespace = (editor: Editor): boolean => {
  const rng = editor.selection.getRng();
  const container = rng.endContainer;
  return rng.collapsed && container.nodeType === Node.TEXT_NODE && /^[ \u00a0]/.test((container as Text).data.slice(rng.endOffset));
};

const insertCheckbox = (editor: Editor): void => {
  // The space separates the checkbox from its label, so don't add a second one
  const space = isFollowedByWhitespace(editor) ? '' : '&nbsp;';
  editor.insertContent(`<span class="${Checkbox.checkboxClass}">${Checkbox.uncheckedGlyph}</span>${space}`);
};

const toggleCheckbox = (editor: Editor, checkbox: HTMLElement): void => {
  editor.undoManager.transact(() => {
    const glyph = Checkbox.getToggledGlyph(checkbox.textContent ?? '');
    checkbox.textContent = glyph;
    editor.dom.setAttrib(checkbox, 'aria-checked', String(Checkbox.isChecked(glyph)));
  });
};

const toggleSelectedCheckbox = (editor: Editor): boolean =>
  getSelectedCheckbox(editor).fold(Fun.never, (checkbox) => {
    toggleCheckbox(editor, checkbox);
    // Selecting it again refreshes the offscreen copy of the selection that screen readers read
    editor.selection.select(checkbox);
    return true;
  });

export {
  getToggleableCheckbox,
  insertCheckbox,
  toggleCheckbox,
  toggleSelectedCheckbox
};
