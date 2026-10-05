import { Arr, Obj, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import AstNode from 'tinymce/core/api/html/Node';
import Schema from 'tinymce/core/api/html/Schema';

import * as Checkbox from './Checkbox';

// A glyph followed by U+FE0F is the emoji presentation (e.g. the ballot box with check emoji), not a form checkbox
const glyphSplitRegExp = /([\u2610-\u2612](?!\uFE0F))/;
const hasGlyphRegExp = /[\u2610-\u2612](?!\uFE0F)/;
const hasGlyphInHtmlRegExp = /[\u2610-\u2612]|&#(?:974[456]|x261[012]);/i;

// Glyphs in here are literal text (code samples, embed fallback content), not form checkboxes
const nonWrappingElements = [ 'audio', 'video', 'object', 'pre', 'code', 'kbd', 'samp' ];

const getClasses = (node: AstNode): string[] =>
  node.attr('class')?.split(/\s+/) ?? [];

const isCheckboxNode = (node: AstNode): boolean =>
  node.name === 'span' && Arr.contains(getClasses(node), Checkbox.checkboxClass);

// Only a span holding exactly one glyph is a checkbox, anything else could not be toggled or edited
const isValidCheckboxNode = (node: AstNode): boolean => {
  const child = node.firstChild;
  return isCheckboxNode(node) && Type.isNonNullable(child) && child === node.lastChild && child.type === 3 && Checkbox.isGlyph(child.value ?? '');
};

const removeCheckboxClass = (node: AstNode): void => {
  const classes = Arr.filter(getClasses(node), (cls) => cls !== Checkbox.checkboxClass);
  node.attr('class', classes.length > 0 ? classes.join(' ') : null);
};

const markAsCheckbox = (node: AstNode): void => {
  node.attr({
    'contenteditable': 'false',
    // Lets formats (bold, colors, font size) wrap the checkbox like the surrounding text
    'data-mce-cef-wrappable': 'true'
  });
};

const isInNonWrappingElement = (schema: Schema, node: AstNode): boolean => {
  const specialElements = schema.getSpecialElements();
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (Obj.has(specialElements, parent.name) || Arr.contains(nonWrappingElements, parent.name)) {
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
  const node = AstNode.create('span', { class: Checkbox.checkboxClass });
  markAsCheckbox(node);
  node.append(createTextNode(glyph));
  return node;
};

// Content from Word, or typed with charmap, has bare ballot box characters. Give each its own checkbox span.
const wrapBareGlyphs = (schema: Schema, node: AstNode): void => {
  const text = node.value;
  const parent = node.parent;
  if (!text || !hasGlyphRegExp.test(text) || !parent || isValidCheckboxNode(parent)
    || !schema.isValidChild(parent.name, 'span') || isInNonWrappingElement(schema, node)) {
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

    // A #text filter makes the parser collect every text node, which is noticeable on large documents,
    // so only register it once content with a ballot box shows up
    let isTextFilterRegistered = false;
    editor.on('BeforeSetContent', (e) => {
      if (!isTextFilterRegistered && Type.isString(e.content) && hasGlyphInHtmlRegExp.test(e.content)) {
        isTextFilterRegistered = true;
        parser.addNodeFilter('#text', (nodes) => {
          Arr.each(nodes, (node) => wrapBareGlyphs(schema, node));
        });
      }
    });

    // Registered after the core class filters, so a class removed by valid_classes is already gone
    parser.addAttributeFilter('class', (nodes) => {
      Arr.each(nodes, (node) => {
        if (isValidCheckboxNode(node)) {
          markAsCheckbox(node);
        } else if (isCheckboxNode(node)) {
          removeCheckboxClass(node);
        }
      });
    });

    serializer.addNodeFilter('span', (nodes) => {
      Arr.each(nodes, (node) => {
        if (isCheckboxNode(node)) {
          node.attr('contenteditable', null);
          node.attr('data-mce-cef-wrappable', null);
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
