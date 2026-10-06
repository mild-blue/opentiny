import { Clipboard, Mouse, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/checkbox/Plugin';

describe('browser.tinymce.plugins.checkbox.PointerTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'checkbox',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  const unchecked = '\u2610';
  const checked = '\u2612';
  const box = (glyph: string) => `<span class="mce-checkbox">${glyph}</span>`;

  const getCheckbox = (editor: Editor, index: number = 0): SugarElement<HTMLElement> =>
    UiFinder.findAllIn<HTMLElement>(TinyDom.body(editor), 'span.mce-checkbox')[index];

  const getParent = (editor: Editor, selector: string): Node | null =>
    editor.dom.getParent(editor.selection.getNode(), selector);

  it('A right click selects the checkbox as core does, so the context menu acts on its row', () => {
    const editor = hook.editor();
    editor.setContent(`<table><tbody><tr><td>one</td></tr><tr><td>two</td></tr><tr><td>${box(unchecked)} three</td></tr></tbody></table>`);
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 1);
    Mouse.mouseDown(getCheckbox(editor), { button: 2 });
    assert.equal(getParent(editor, 'tr'), editor.dom.select('tr')[2], 'The selection should be in the row of the checkbox');
  });

  it('A triple click on a checkbox selects its own paragraph', () => {
    const editor = hook.editor();
    editor.setContent(`<p>${box(unchecked)} first</p><p>second</p>`);
    TinySelections.setCursor(editor, [ 1, 0 ], 2);
    const checkbox = getCheckbox(editor).dom;
    const rect = checkbox.getBoundingClientRect();
    const win = editor.getWin() as Window & typeof globalThis;
    checkbox.dispatchEvent(new win.MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0, detail: 3, clientX: rect.left + 1, clientY: rect.top + 1 }));
    assert.equal(editor.dom.getParent(editor.selection.getStart(), 'p'), editor.dom.select('p')[0]);
    assert.notInclude(editor.selection.getContent({ format: 'text' }), 'second');
  });

  it('A click while table cells are selected leaves a caret at the checkbox instead of the cell selection', () => {
    const editor = hook.editor();
    editor.setContent(`<table><tbody><tr><td>one</td><td>two</td><td>${box(unchecked)} three</td></tr></tbody></table>`);
    const cells = editor.dom.select('td');
    editor.dom.setAttrib(cells[0], 'data-mce-selected', '1');
    editor.dom.setAttrib(cells[1], 'data-mce-selected', '1');
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 1, 0 ], 3);

    Mouse.trueClick(getCheckbox(editor));
    assert.isTrue(editor.selection.isCollapsed(), 'The selection should be a caret');
    assert.equal(getParent(editor, 'td'), cells[2], 'The caret should be in the cell of the checkbox');
    assert.include(editor.getContent(), `<td>one</td>\n<td>two</td>`);
  });

  it('A click that drifts does not drag the checkbox away', () => {
    const editor = hook.editor();
    editor.resetContent(`<p>${box(unchecked)} a</p><p>second paragraph</p>`);
    const checkbox = getCheckbox(editor);
    const target = SugarElement.fromDom(editor.dom.select('p')[1]);
    Mouse.mouseDown(checkbox);
    Mouse.mouseMoveTo(target, 20, 5);
    Mouse.mouseUp(target);
    TinyAssertions.assertContent(editor, `<p>${box(unchecked)} a</p>\n<p>second paragraph</p>`);
    assert.isFalse(editor.isDirty());
  });

  it('Checkboxes in a table pasted into table cells are marked and toggle', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td>x</td></tr></tbody></table>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 1);
    Clipboard.pasteItems(TinyDom.body(editor), { 'text/html': `<table><tbody><tr><td>${box(unchecked)} pasted</td></tr></tbody></table>` });
    UiFinder.exists(TinyDom.body(editor), 'td span.mce-checkbox[contenteditable="false"][role="checkbox"]');

    Mouse.trueClick(getCheckbox(editor));
    assert.include(editor.getContent(), `${box(checked)} pasted`);
  });
});
