import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import AstNode from 'tinymce/core/api/html/Node';
import Schema from 'tinymce/core/api/html/Schema';

import * as Checkbox from './Checkbox';

const glyphSplitRegExp = /([\u2610-\u2612])/;
const hasGlyphRegExp = /[\u2610-\u2612]/;

const isCheckboxNode = (node: AstNode): boolean =>
  node.name === 'span' && Arr.contains(node.attr('class')?.split(/\s+/) ?? [], Checkbox.checkboxClass);

const isInsideCheckbox = (node: AstNode): boolean => {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (isCheckboxNode(parent)) {
      return true;
    }
  }
  return false;
};

const createTextNode = (text: string): AstNode => {
  const node = new AstNode('#text', 3);
  node.value = text;
  return node;
};

const createCheckboxNode = (glyph: string): AstNode => {
  const node = AstNode.create('span', { class: Checkbox.checkboxClass, contenteditable: 'false' });
  node.append(createTextNode(glyph));
  return node;
};

// Content from Word, or typed with charmap, has bare ballot box characters. Give each its own checkbox span.
const wrapBareGlyphs = (schema: Schema, node: AstNode): void => {
  const text = node.value;
  const parent = node.parent;
  if (!text || !hasGlyphRegExp.test(text) || !parent || !schema.isValidChild(parent.name, 'span') || isInsideCheckbox(node)) {
    return;
  }

  Arr.each(text.split(glyphSplitRegExp), (part) => {
    if (part.length > 0) {
      parent.insert(Checkbox.isGlyph(part) ? createCheckboxNode(part) : createTextNode(part), node, true);
    }
  });
  node.remove();
};

const setup = (editor: Editor): void => {
  editor.on('PreInit', () => {
    const { parser, serializer, schema } = editor;

    parser.addNodeFilter('#text', (nodes) => {
      Arr.each(nodes, (node) => wrapBareGlyphs(schema, node));
    });

    parser.addNodeFilter('span', (nodes) => {
      Arr.each(nodes, (node) => {
        if (isCheckboxNode(node)) {
          node.attr('contenteditable', 'false');
        }
      });
    });

    serializer.addNodeFilter('span', (nodes) => {
      Arr.each(nodes, (node) => {
        if (isCheckboxNode(node)) {
          node.attr('contenteditable', null);
          // Read-only mode stashes contenteditable here and restores it on serialization
          node.attr('data-mce-contenteditable', null);
        }
      });
    });
  });
};

export {
  setup
};
