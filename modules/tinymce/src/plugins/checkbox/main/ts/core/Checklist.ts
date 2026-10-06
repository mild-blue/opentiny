import { Arr, Optional, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Actions from './Actions';
import * as Checkbox from './Checkbox';

// A checklist is a bullet list whose items start with a checkbox instead of a bullet. The inline list style hides
// the bullets wherever the saved content is shown, the class is how the editor recognizes a checklist.
const checklistClass = 'mce-checklist';
const checklistDetail = { 'list-style-type': 'none', 'list-attributes': { class: checklistClass }};

const isChecklist = (node: Node | null | undefined): node is HTMLUListElement =>
  node?.nodeName === 'UL' && (node as Element).classList.contains(checklistClass);

const isChecklistItem = (node: Node | null | undefined): node is HTMLLIElement =>
  node?.nodeName === 'LI' && isChecklist(node.parentNode);

// Caret containers next to the contenteditable="false" checkbox are zero width no-break spaces
const isBlankText = (node: Node): node is Text =>
  node.nodeType === Node.TEXT_NODE && /^[\s\uFEFF]*$/.test((node as Text).data);

const getLeadingCheckbox = (editor: Editor, item: HTMLLIElement): Optional<HTMLElement> =>
  Arr.find(Arr.from(item.childNodes), (node) => !isBlankText(node))
    .filter((node): node is HTMLElement => Actions.isCheckboxElement(editor, node));

const isInChecklist = (editor: Editor): boolean =>
  isChecklist(editor.dom.getParent(editor.selection.getNode(), 'ul,ol,dl'));

const getSelectedItems = (editor: Editor): HTMLLIElement[] =>
  Arr.unique(Arr.bind(editor.selection.getSelectedBlocks(), (block) =>
    Optional.from(editor.dom.getParent(block, 'li')).filter(isChecklistItem).toArray()));

const moveCaretAfter = (editor: Editor, item: HTMLLIElement, space: Text): void => {
  const rng = editor.selection.getRng();
  const afterSpace = editor.getDoc().createRange();
  afterSpace.setStart(space, space.length);
  if (rng.collapsed && item.contains(rng.startContainer) && rng.compareBoundaryPoints(window.Range.START_TO_START, afterSpace) < 0) {
    editor.selection.setCursorLocation(space, space.length);
  }
};

const addCheckbox = (editor: Editor, item: HTMLLIElement): void => {
  if (getLeadingCheckbox(editor, item).isNone()) {
    Arr.each(Arr.from(item.childNodes), (node) => {
      if (node.nodeName === 'BR' && editor.dom.getAttrib(node as Element, 'data-mce-bogus')) {
        editor.dom.remove(node);
      }
    });
    const space = editor.getDoc().createTextNode('\u00a0');
    item.insertBefore(space, item.firstChild);
    item.insertBefore(Actions.createCheckbox(editor, Checkbox.uncheckedGlyph), space);
    moveCaretAfter(editor, item, space);
  }
};

const removeCheckbox = (editor: Editor, item: HTMLLIElement): void => {
  getLeadingCheckbox(editor, item).each((checkbox) => {
    const next = checkbox.nextSibling;
    if (Type.isNonNullable(next) && next.nodeType === Node.TEXT_NODE && /^[ \u00a0]/.test((next as Text).data)) {
      (next as Text).deleteData(0, 1);
    }
    editor.dom.remove(checkbox);
  });
};

const toggleChecklist = (editor: Editor): void => {
  editor.undoManager.transact(() => {
    if (isInChecklist(editor)) {
      Arr.each(getSelectedItems(editor), (item) => removeCheckbox(editor, item));
      editor.execCommand('RemoveList');
    } else {
      editor.execCommand('InsertUnorderedList', false, checklistDetail);
      // The list style applies to the whole list, so every item of it needs a checkbox, not just the selected ones
      const checklists = Arr.unique(Arr.map(getSelectedItems(editor), (item) => item.parentNode as HTMLUListElement));
      Arr.each(checklists, (list) => {
        Arr.each(Arr.filter(Arr.from(list.children), isChecklistItem), (item) => addCheckbox(editor, item));
      });
    }
  });
};

export {
  isInChecklist,
  toggleChecklist
};
