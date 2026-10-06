import { Arr, Obj, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import AstNode from 'tinymce/core/api/html/Node';
import Schema from 'tinymce/core/api/html/Schema';

import * as Actions from './Actions';
import * as Checkbox from './Checkbox';

// A glyph followed by U+FE0F is the emoji presentation (e.g. the ballot box with check emoji), not a form checkbox
const glyphSplitRegExp = /([\u2610-\u2612](?!\uFE0F))/;
const hasGlyphRegExp = /[\u2610-\u2612](?!\uFE0F)/;

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
  node.attr(Checkbox.editorAttributes);
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

// valid_elements, extended_valid_elements or valid_classes can drop the class from saved content. Wrapping glyphs then
// would only nest one more class-less span around them on every save and load, so leave them as text.
const canSaveCheckboxes = (schema: Schema): boolean => {
  const validClasses = schema.getValidClasses();
  return schema.isValid('span', 'class') && (Type.isUndefined(validClasses) ||
    Arr.exists([ validClasses['*'], validClasses.span ], (classes) => Type.isNonNullable(classes) && Obj.has(classes, Checkbox.checkboxClass)));
};

// Content can skip the parser, e.g. a table pasted into table cells, so mark the checkboxes it brought in
const markUnparsedCheckboxes = (editor: Editor): void => {
  Arr.each(editor.dom.select(`span.${Checkbox.checkboxClass}:not([contenteditable])`), (span) => {
    if (Actions.isCheckboxElement(editor, span)) {
      editor.dom.setAttribs(span, Checkbox.editorAttributes);
    }
  });
};

const setup = (editor: Editor): void => {
  editor.on('SetContent', () => markUnparsedCheckboxes(editor));

  editor.on('PreInit', () => {
    const { parser, serializer, schema } = editor;

    if (canSaveCheckboxes(schema)) {
      parser.addNodeFilter('#text', (nodes) => {
        Arr.each(nodes, (node) => wrapBareGlyphs(schema, node));
      });
    }

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
          Arr.each(Obj.keys(Checkbox.editorAttributes), (name) => node.attr(name, null));
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
