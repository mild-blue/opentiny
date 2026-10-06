import { Mouse, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/checkbox/Plugin';

describe('browser.tinymce.plugins.checkbox.ToggleCommandTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'checkbox',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  const unchecked = '\u2610';
  const checked = '\u2612';
  const box = (glyph: string) => `<span class="mce-checkbox">${glyph}</span>`;

  const getCheckboxes = (editor: Editor): SugarElement<HTMLElement>[] =>
    UiFinder.findAllIn<HTMLElement>(TinyDom.body(editor), 'p span.mce-checkbox');

  const assertCheckboxSelected = (editor: Editor) => {
    assert.isTrue(editor.dom.is(editor.selection.getNode(), 'span.mce-checkbox'), 'The checkbox should be selected');
    UiFinder.exists(TinyDom.body(editor), 'span.mce-checkbox[data-mce-selected]');
  };

  const assertAriaChecked = (editor: Editor, expected: string[]) =>
    assert.deepEqual(editor.dom.select('p span.mce-checkbox').map((checkbox) => checkbox.getAttribute('aria-checked')), expected);

  it('mceToggleCheckbox does not toggle in read-only mode', () => {
    const editor = hook.editor();
    editor.setContent(`<p>a${box(unchecked)} b</p>`);
    editor.selection.select(editor.dom.select('p span.mce-checkbox')[0]);
    editor.mode.set('readonly');
    editor.execCommand('mceToggleCheckbox');
    editor.mode.set('design');
    TinyAssertions.assertContent(editor, `<p>a${box(unchecked)} b</p>`);
  });

  it('mceToggleCheckbox toggles the selected checkbox and nothing else', () => {
    const editor = hook.editor();
    editor.setContent(`<p>a${box(unchecked)} b ${box(unchecked)}</p>`);
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    editor.execCommand('mceToggleCheckbox');
    TinyAssertions.assertContent(editor, `<p>a${box(unchecked)} b ${box(unchecked)}</p>`);

    editor.selection.select(editor.dom.select('p span.mce-checkbox')[1]);
    editor.execCommand('mceToggleCheckbox');
    TinyAssertions.assertContent(editor, `<p>a${box(unchecked)} b ${box(checked)}</p>`);
    assertCheckboxSelected(editor);
  });

  it('Has role="checkbox" and aria-checked in the editor only, kept in sync when toggling', () => {
    const editor = hook.editor();
    editor.setContent(`<p>${unchecked} a ${box(checked)} b</p>`);
    UiFinder.exists(TinyDom.body(editor), 'span.mce-checkbox[role="checkbox"]');
    assertAriaChecked(editor, [ 'false', 'true' ]);

    Mouse.trueClick(getCheckboxes(editor)[0]);
    assertAriaChecked(editor, [ 'true', 'true' ]);

    editor.selection.select(editor.dom.select('p span.mce-checkbox')[1]);
    editor.execCommand('mceToggleCheckbox');
    assertAriaChecked(editor, [ 'true', 'false' ]);
    // The offscreen copy of the selection, which screen readers read, shows the new state too
    UiFinder.exists(TinyDom.body(editor), '.mce-offscreen-selection span.mce-checkbox[aria-checked="false"]');

    editor.undoManager.undo();
    assertAriaChecked(editor, [ 'true', 'true' ]);

    const content = editor.getContent();
    assert.notInclude(content, 'role=');
    assert.notInclude(content, 'aria-checked');
    assert.notInclude(content, 'data-mce');
  });
});
