import { Clipboard, Mouse, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/checkbox/Plugin';

describe('browser.tinymce.plugins.checkbox.CheckboxPluginTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'checkbox',
    toolbar: 'checkbox',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const unchecked = '\u2610';
  const checkedAlt = '\u2611';
  const checked = '\u2612';
  const box = (glyph: string) => `<span class="mce-checkbox">${glyph}</span>`;

  const getCheckboxes = (editor: Editor): SugarElement<HTMLElement>[] =>
    UiFinder.findAllIn<HTMLElement>(TinyDom.body(editor), 'span.mce-checkbox');

  const clickCheckbox = (editor: Editor, index: number = 0) =>
    Mouse.trueClick(getCheckboxes(editor)[index]);

  const assertNoContentEditableInContent = (editor: Editor) =>
    assert.notInclude(editor.getContent(), 'contenteditable');

  it('Insert a checkbox from the toolbar button', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Insert checkbox"]');
    TinyAssertions.assertContent(editor, `<p>a${box(unchecked)}&nbsp;</p>`);
    UiFinder.exists(TinyDom.body(editor), 'span.mce-checkbox[contenteditable="false"]');
  });

  it('Does not add a space after an inserted checkbox when one follows already', () => {
    const editor = hook.editor();
    editor.setContent('<p>a b</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    editor.execCommand('mceInsertCheckbox');
    TinyAssertions.assertContent(editor, `<p>a${box(unchecked)} b</p>`);
  });

  it('Insert a checkbox with the mceInsertCheckbox command, in one undo level', () => {
    const editor = hook.editor();
    editor.resetContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    editor.execCommand('mceInsertCheckbox');
    TinyAssertions.assertContent(editor, `<p>a${box(unchecked)}&nbsp;</p>`);
    editor.undoManager.undo();
    TinyAssertions.assertContent(editor, '<p>a</p>');
  });

  it('Click toggles both ways, keeps the selection and does not select the checkbox', () => {
    const editor = hook.editor();
    editor.setContent(`<p>${box(unchecked)} a</p><p>text</p>`);
    TinySelections.setCursor(editor, [ 1, 0 ], 3);

    clickCheckbox(editor);
    TinyAssertions.assertContent(editor, `<p>${box(checked)} a</p>\n<p>text</p>`);
    TinyAssertions.assertCursor(editor, [ 1, 0 ], 3);
    UiFinder.notExists(TinyDom.body(editor), '[data-mce-selected]');

    clickCheckbox(editor);
    TinyAssertions.assertContent(editor, `<p>${box(unchecked)} a</p>\n<p>text</p>`);
    TinyAssertions.assertCursor(editor, [ 1, 0 ], 3);
    UiFinder.notExists(TinyDom.body(editor), '[data-mce-selected]');
  });

  it('A click still reaches other click handlers and focuses the editor', () => {
    const editor = hook.editor();
    editor.setContent(`<p>${box(unchecked)} a</p>`);
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    let clicks = 0;
    const onClick = () => clicks++;
    editor.on('click', onClick);
    clickCheckbox(editor);
    editor.off('click', onClick);
    input.remove();
    assert.equal(clicks, 1);
    assert.isTrue(editor.hasFocus());
    TinyAssertions.assertContent(editor, `<p>${box(checked)} a</p>`);
  });

  it('A click with a modifier key does not toggle', () => {
    const editor = hook.editor();
    editor.setContent(`<p>${box(unchecked)} a</p>`);
    const checkbox = getCheckboxes(editor)[0];
    Mouse.mouseDown(checkbox);
    Mouse.mouseUp(checkbox);
    Mouse.click(checkbox, { ctrlKey: true });
    Mouse.click(checkbox, { metaKey: true });
    TinyAssertions.assertContent(editor, `<p>${box(unchecked)} a</p>`);
  });

  it('Only the clicked checkbox toggles', () => {
    const editor = hook.editor();
    editor.setContent(`<p>${box(unchecked)} a ${box(unchecked)} b</p>`);
    clickCheckbox(editor, 1);
    TinyAssertions.assertContent(editor, `<p>${box(unchecked)} a ${box(checked)} b</p>`);
  });

  it('Checked with a check mark toggles to unchecked', () => {
    const editor = hook.editor();
    editor.setContent(`<p>${box(checkedAlt)} a</p>`);
    clickCheckbox(editor);
    TinyAssertions.assertContent(editor, `<p>${box(unchecked)} a</p>`);
    clickCheckbox(editor);
    TinyAssertions.assertContent(editor, `<p>${box(checked)} a</p>`);
  });

  it('Each toggle is one undo level', () => {
    const editor = hook.editor();
    editor.resetContent(`<p>${box(unchecked)} a</p>`);
    clickCheckbox(editor);
    clickCheckbox(editor);
    TinyAssertions.assertContent(editor, `<p>${box(unchecked)} a</p>`);

    editor.undoManager.undo();
    TinyAssertions.assertContent(editor, `<p>${box(checked)} a</p>`);
    editor.undoManager.undo();
    TinyAssertions.assertContent(editor, `<p>${box(unchecked)} a</p>`);
    assert.isFalse(editor.undoManager.hasUndo());

    editor.undoManager.redo();
    TinyAssertions.assertContent(editor, `<p>${box(checked)} a</p>`);
    // The checkbox element was replaced by undo, so it must still be clickable afterwards
    clickCheckbox(editor);
    TinyAssertions.assertContent(editor, `<p>${box(unchecked)} a</p>`);
  });

  it('Toggling fires change and makes the editor dirty', () => {
    const editor = hook.editor();
    editor.resetContent(`<p>${box(unchecked)} a</p>`);
    assert.isFalse(editor.isDirty());
    let changes = 0;
    const onChange = () => changes++;
    editor.on('change', onChange);
    clickCheckbox(editor);
    editor.off('change', onChange);
    assert.isTrue(editor.isDirty());
    assert.equal(changes, 1);
  });

  it('Wraps bare glyphs on setContent and leaves other glyphs alone', () => {
    const editor = hook.editor();
    editor.setContent(`<p>${unchecked} A &nbsp;${checkedAlt} B${checked}C \u25fb D</p>`);
    TinyAssertions.assertContent(editor, `<p>${box(unchecked)} A &nbsp;${box(checkedAlt)} B${box(checked)}C \u25fb D</p>`);
    assert.lengthOf(getCheckboxes(editor), 3);
  });

  it('Wraps bare glyphs in a table cell', () => {
    const editor = hook.editor();
    const table = (cell: string) => `<table>\n<tbody>\n<tr>\n<td>${cell}</td>\n</tr>\n</tbody>\n</table>`;
    editor.setContent(table(`${unchecked} Preanalytic &nbsp; ${unchecked} Analytic`));
    TinyAssertions.assertContent(editor, table(`${box(unchecked)} Preanalytic &nbsp; ${box(unchecked)} Analytic`));
    clickCheckbox(editor, 1);
    TinyAssertions.assertContent(editor, table(`${box(unchecked)} Preanalytic &nbsp; ${box(checked)} Analytic`));
  });

  it('Does not wrap a glyph that is already in a checkbox span', () => {
    const editor = hook.editor();
    editor.setContent(`<p>${box(checked)}</p>`);
    TinyAssertions.assertContent(editor, `<p>${box(checked)}</p>`);
    assert.lengthOf(getCheckboxes(editor), 1);
  });

  it('A checkbox span that does not hold exactly one glyph is turned back into text, with its glyphs wrapped', () => {
    const editor = hook.editor();
    editor.setContent(`<p><span class="mce-checkbox">${unchecked} Yes</span></p><p><span class="mce-checkbox"><strong>${checked}</strong></span></p>`);
    TinyAssertions.assertContent(editor, `<p>${box(unchecked)} Yes</p>\n<p><strong>${box(checked)}</strong></p>`);
    UiFinder.notExists(TinyDom.body(editor), '[contenteditable="false"]:not(.mce-checkbox)');
    clickCheckbox(editor, 1);
    TinyAssertions.assertContent(editor, `<p>${box(unchecked)} Yes</p>\n<p><strong>${box(unchecked)}</strong></p>`);
  });

  it('Leaves glyphs in code, preformatted text and embed fallback content alone', () => {
    const editor = hook.editor();
    const html = `<pre>${unchecked} x</pre>\n<p><code>${unchecked}</code> <kbd>${checked}</kbd> <samp>${checked}</samp></p>\n` +
      `<p><video src="https://example.com/x.mp4" width="300" height="150">${unchecked}</video></p>\n` +
      `<p><iframe src="https://example.com/x" sandbox="">${unchecked}</iframe></p>`;
    editor.setContent(html);
    TinyAssertions.assertContent(editor, html);
    assert.lengthOf(getCheckboxes(editor), 0);
  });

  it('Leaves the ballot box with check emoji alone', () => {
    const editor = hook.editor();
    editor.setContent(`<p>${checkedAlt}\uFE0F done, ${checkedAlt} form</p>`);
    TinyAssertions.assertContent(editor, `<p>${checkedAlt}\uFE0F done, ${box(checkedAlt)} form</p>`);
  });

  it('Formats apply to checkboxes like to the surrounding text', () => {
    const editor = hook.editor();
    editor.setContent(`<p>a ${unchecked} b</p>`);
    editor.execCommand('SelectAll');
    editor.execCommand('Bold');
    TinyAssertions.assertContent(editor, `<p><strong>a ${box(unchecked)} b</strong></p>`);
    clickCheckbox(editor);
    TinyAssertions.assertContent(editor, `<p><strong>a ${box(checked)} b</strong></p>`);
  });

  it('Wraps bare glyphs on insertContent', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    editor.insertContent(` ${unchecked} b`);
    TinyAssertions.assertContent(editor, `<p>a ${box(unchecked)} b</p>`);
    UiFinder.exists(TinyDom.body(editor), 'span.mce-checkbox[contenteditable="false"]');
  });

  it('Wraps bare glyphs on HTML paste', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    Clipboard.pasteItems(TinyDom.body(editor), { 'text/html': `<p>${unchecked} Ano ${checked} Ne</p>` });
    TinyAssertions.assertContent(editor, `<p>a${box(unchecked)} Ano ${box(checked)} Ne</p>`);
  });

  // A plain text only paste event goes through the native paste bin, which a synthetic event can't fill
  it('Wraps bare glyphs on plain text paste', () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    editor.execCommand('mceInsertClipboardContent', false, { text: `x ${unchecked} b` });
    TinyAssertions.assertContent(editor, `<p>ax ${box(unchecked)} b</p>`);
  });

  it('Serialized content never contains contenteditable', () => {
    const editor = hook.editor();
    editor.setContent(`<p><span class="mce-checkbox" contenteditable="false">${unchecked}</span> a ${checked}</p>`);
    UiFinder.exists(TinyDom.body(editor), 'span.mce-checkbox[contenteditable="false"]');
    TinyAssertions.assertContent(editor, `<p>${box(unchecked)} a ${box(checked)}</p>`);
    assertNoContentEditableInContent(editor);
    assert.equal(editor.getContent({ format: 'text' }), `${unchecked} a ${checked}`);
  });

  it('Does not toggle in read-only mode, and the content stays clean', () => {
    const editor = hook.editor();
    editor.setContent(`<p>${box(unchecked)} a</p>`);
    editor.mode.set('readonly');
    clickCheckbox(editor);
    TinyAssertions.assertContent(editor, `<p>${box(unchecked)} a</p>`);
    assertNoContentEditableInContent(editor);
    editor.mode.set('design');
    clickCheckbox(editor);
    TinyAssertions.assertContent(editor, `<p>${box(checked)} a</p>`);
  });

  it('Content set in read-only mode with contenteditable on the span serializes without it', () => {
    const editor = hook.editor();
    editor.mode.set('readonly');
    editor.setContent(`<p><span class="mce-checkbox" contenteditable="false">${unchecked}</span> a</p>`);
    TinyAssertions.assertContent(editor, `<p>${box(unchecked)} a</p>`);
    editor.mode.set('design');
  });

  it('Does not toggle inside a contenteditable="false" element', () => {
    const editor = hook.editor();
    editor.setContent(`<div contenteditable="false"><p>${box(unchecked)} a</p></div>`);
    clickCheckbox(editor);
    TinyAssertions.assertContent(editor, `<div contenteditable="false">\n<p>${box(unchecked)} a</p>\n</div>`);
  });
});
