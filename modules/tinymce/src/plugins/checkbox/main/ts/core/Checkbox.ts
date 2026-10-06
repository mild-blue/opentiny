const checkboxClass = 'mce-checkbox';

// Same glyphs Word swaps in its checkbox content controls
const uncheckedGlyph = '\u2610'; // BALLOT BOX
const checkedGlyph = '\u2612'; // BALLOT BOX WITH X
const checkedAltGlyph = '\u2611'; // BALLOT BOX WITH CHECK, only ever read, never written

const glyphRegExp = /^[\u2610-\u2612]$/;

const isGlyph = (text: string): boolean =>
  glyphRegExp.test(text);

const isChecked = (glyph: string): boolean =>
  glyph === checkedGlyph || glyph === checkedAltGlyph;

const getToggledGlyph = (glyph: string): string =>
  isChecked(glyph) ? uncheckedGlyph : checkedGlyph;

// Attributes a checkbox only has in the editor, saved content has the bare span
const getEditorAttributes = (glyph: string): Record<string, string> => ({
  'contenteditable': 'false',
  // Lets formats (bold, colors, font size) wrap the checkbox like the surrounding text
  'data-mce-cef-wrappable': 'true',
  'role': 'checkbox',
  'aria-checked': String(isChecked(glyph))
});

export {
  checkboxClass,
  uncheckedGlyph,
  isGlyph,
  isChecked,
  getToggledGlyph,
  getEditorAttributes
};
