import { Fun, Optional, Optionals } from '@ephox/katamari';
import { Compare, PredicateFind, SugarElement } from '@ephox/sugar';

import EditorSelection from '../api/dom/Selection';
import Editor from '../api/Editor';
import Schema from '../api/html/Schema';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as ElementType from '../dom/ElementType';
import * as DeleteUtils from './DeleteUtils';
import * as MergeBlocks from './MergeBlocks';

const deleteRangeMergeBlocks = (rootNode: SugarElement<Node>, selection: EditorSelection, schema: Schema): Optional<() => void> => {
  const rng = selection.getRng();

  return Optionals.lift2(
    DeleteUtils.getParentBlock(rootNode, SugarElement.fromDom(rng.startContainer)),
    DeleteUtils.getParentBlock(rootNode, SugarElement.fromDom(rng.endContainer)),
    (block1, block2) => {
      if (!Compare.eq(block1, block2)) {
        return Optional.some(() => {
          rng.deleteContents();
          MergeBlocks.mergeBlocks(rootNode, true, block1, block2, schema).each((pos) => {
            selection.setRng(pos.toRange());
          });

        });
      } else {
        return Optional.none();
      }
    }).getOr(Optional.none());
};

const isRawNodeInTable = (root: SugarElement<Node>, rawNode: Node): boolean => {
  const node = SugarElement.fromDom(rawNode);
  const isRoot = Fun.curry(Compare.eq, root);
  return PredicateFind.ancestor(node, ElementType.isTableCell, isRoot).isSome();
};

const isSelectionInTable = (root: SugarElement<Node>, rng: Range): boolean =>
  isRawNodeInTable(root, rng.startContainer) || isRawNodeInTable(root, rng.endContainer);

const isEverythingSelected = (root: SugarElement<Node>, rng: Range): boolean => {
  const noPrevious = CaretFinder.prevPosition(root.dom, CaretPosition.fromRangeStart(rng)).isNone();
  const noNext = CaretFinder.nextPosition(root.dom, CaretPosition.fromRangeEnd(rng)).isNone();
  return !isSelectionInTable(root, rng) && noPrevious && noNext;
};

const emptyEditor = (editor: Editor): Optional<() => void> => {
  return Optional.some(() => {
    if (editor.hasEditableRoot()) {
      editor.setContent('');
    } else {
      editor.setContent(`<div class=${editor.getParam('editable_class')}>${editor.getParam('placeholder')}</div>`);
    }
    editor.selection.setCursorLocation();
  });
};

const getClosestEditableDiv = (editor: Editor): HTMLElement | null => {
  const node = editor.selection.getNode();
  return node.closest('.editable');
};

const emptyEditableDiv = (editor: Editor, editableDiv: Element): Optional<() => void> => {
  return Optional.some(() => {
    editableDiv.innerHTML = '<p><br data-mce-bogus="1"></p>';
    editor.selection.setCursorLocation();
  });
};

const deleteRange = (editor: Editor): Optional<() => void> => {
  let rootNode;
  const editableDiv = getClosestEditableDiv(editor);
  const rng = editor.selection.getRng();
  if(!editor.hasEditableRoot() && editableDiv){
      rootNode = SugarElement.fromDom(editableDiv as Node);
      return isEverythingSelected(rootNode, rng) ? emptyEditableDiv(editor, editableDiv) : deleteRangeMergeBlocks(rootNode, editor.selection, editor.schema);
  } 
  rootNode = SugarElement.fromDom(editor.getBody());
  return isEverythingSelected(rootNode, rng) ? emptyEditor(editor) : deleteRangeMergeBlocks(rootNode, editor.selection, editor.schema);
};


const deleteSymbol = (editor: Editor): Optional<() => void> => {
  if(editor.hasEditableRoot()){
    return Optional.none();
  }
  const editableDiv = getClosestEditableDiv(editor);
  if(editableDiv?.textContent?.length == 1){
    return emptyEditableDiv(editor, editableDiv);
  }
  return Optional.none();
}

const backspaceDelete = (editor: Editor, _forward: boolean): Optional<() => void> =>
  editor.selection.isCollapsed() ? deleteSymbol(editor) : deleteRange(editor);

export {
  backspaceDelete
};
