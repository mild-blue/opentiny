import {Class, SugarElement} from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';

const addToEditor = (editor: Editor): void => {
  const isEditable = (node: Element | null): boolean => editor.dom.isEditable(node);
  const isInEditableContext = (el: Element) => isEditable(el.parentElement);
  const isPagebreak = (node: Element) => Class.has(SugarElement.fromDom(node), 'mce-pagebreak');
  const isImage = (node: Element): boolean => {
    const isImageFigure = node.nodeName === 'FIGURE' && /image/i.test(node.className);
    const isImage = node.nodeName === 'IMG' || isImageFigure;
    return isImage && isInEditableContext(node) && !isPagebreak(node);
  };

  const imageToolbarItems = Options.getImageToolbarItems(editor);
  if (imageToolbarItems.length > 0) {
    editor.ui.registry.addContextToolbar('imageselection', {
      predicate: (node) => isImage(node),
      items: imageToolbarItems,
      position: 'node'
    });
  }

  const textToolbarItems = Options.getTextSelectionToolbarItems(editor);
  if (textToolbarItems.length > 0) {
    editor.ui.registry.addContextToolbar('textselection', {
      predicate: (node) => !isImage(node) && !isPagebreak(node) && !editor.selection.isCollapsed() && isEditable(node) && !isPagebreak(node),
      items: textToolbarItems,
      position: 'selection',
      scope: 'editor'
    });
  }
};

export {
  addToEditor
};
