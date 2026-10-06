import { Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Checkbox from './Checkbox';

const isCheckboxElement = (editor: Editor, node: Node): node is HTMLElement =>
  editor.dom.is(node, `span.${Checkbox.checkboxClass}`) && node.childNodes.length === 1 &&
  node.firstChild?.nodeType === Node.TEXT_NODE && Checkbox.isGlyph(node.textContent ?? '');

const createCheckbox = (editor: Editor, glyph: string): HTMLElement =>
  editor.dom.create('span', { class: Checkbox.checkboxClass, ...Checkbox.editorAttributes }, glyph);

const getToggleableCheckbox = (editor: Editor, target: EventTarget | null): Optional<HTMLElement> =>
  Optional.from(target as Node | null)
    .filter((node): node is HTMLElement => isCheckboxElement(editor, node) && editor.getBody().contains(node))
    .filter((checkbox) => !editor.mode.isReadOnly() && editor.dom.isEditable(checkbox.parentNode));

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
    checkbox.textContent = Checkbox.getToggledGlyph(checkbox.textContent ?? '');
  });
};

export {
  isCheckboxElement,
  createCheckbox,
  getToggleableCheckbox,
  insertCheckbox,
  toggleCheckbox
};
