import { Id } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
const defaultMaxImageWidthPx = 300;

const getContentRootSelector = (editor: Editor): string => {
  const contentRootClass = editor.options.get('document_content_root_class');
  return contentRootClass.startsWith('.') ? contentRootClass : `.${contentRootClass}`;
};

const insertTable = (editor: Editor, columns: number, rows: number): void => {
  editor.execCommand('mceInsertTable', false, { rows, columns });
};

const insertBlob = (editor: Editor, base64: string, blob: Blob): void => {
  const blobCache = editor.editorUpload.blobCache;
  const blobInfo = blobCache.create(Id.generate('mceu'), blob, base64);
  blobCache.add(blobInfo);

  const img = new Image();
  img.src = blobInfo.blobUri();

  img.onload = () => {
    const contentRootElement = editor.dom.select(getContentRootSelector(editor))[0];
    const computedStyles = contentRootElement ? window.getComputedStyle(contentRootElement) : null;
    const maxImageWidth = computedStyles ? parseInt(computedStyles.width) - parseInt(computedStyles.paddingLeft) - parseInt(computedStyles.paddingRight) : defaultMaxImageWidthPx;

    editor.insertContent(editor.dom.createHTML('img', { src: blobInfo.blobUri(), width: `${Math.min(img.naturalWidth, maxImageWidth)}px`}));
  };
    
  img.onerror = (err) => {
    console.error("Failed to load the image blob:", err);
  };
};

export {
  insertTable,
  insertBlob
};
