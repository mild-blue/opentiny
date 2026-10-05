import { Keys, Mouse, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections, TinyState, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/checkbox/Plugin';

describe('browser.tinymce.plugins.checkbox.NoneditableRootTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'checkbox',
    toolbar: 'checkbox',
    editable_class: 'editable',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  const unchecked = '\u2610';
  const checked = '\u2612';
  const box = (glyph: string) => `<span class="mce-checkbox">${glyph}</span>`;

  const clickCheckbox = (editor: Editor, index: number) =>
    Mouse.trueClick(UiFinder.findAllIn<HTMLElement>(TinyDom.body(editor), 'span.mce-checkbox')[index]);

  it('Toggles only checkboxes in editable regions', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      editor.setContent(`<p>${unchecked} a</p><div class="editable"><p>${unchecked} b</p></div>`);
      clickCheckbox(editor, 0);
      const content = (glyph: string) => `<p>${box(unchecked)} a</p>\n<div class="editable">\n<p>${box(glyph)} b</p>\n</div>`;
      TinyAssertions.assertContent(editor, content(unchecked));
      clickCheckbox(editor, 1);
      TinyAssertions.assertContent(editor, content(checked));
    });
  });

  it('Disables the toolbar button on noneditable content', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
      UiFinder.exists(SugarBody.body(), '[aria-label="Insert checkbox"][aria-disabled="true"]');
      TinySelections.setSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 2);
      UiFinder.exists(SugarBody.body(), '[aria-label="Insert checkbox"][aria-disabled="false"]');
    });
  });

  it('Disables the Insert menu item on noneditable content and inserts from it', async () => {
    await TinyState.withNoneditableRootEditorAsync(hook.editor(), async (editor) => {
      editor.setContent('<div>Noneditable content</div><div contenteditable="true">Editable content</div>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
      TinyUiActions.clickOnMenu(editor, 'button:contains("Insert")');
      await TinyUiActions.pWaitForUi(editor, '[role="menuitem"][aria-label="Checkbox"][aria-disabled="true"]');
      TinyUiActions.keystroke(editor, Keys.escape());
      TinySelections.setCursor(editor, [ 1, 0 ], 8);
      TinyUiActions.clickOnMenu(editor, 'button:contains("Insert")');
      await TinyUiActions.pWaitForUi(editor, '[role="menuitem"][aria-label="Checkbox"][aria-disabled="false"]');
      TinyUiActions.clickOnUi(editor, '[role="menuitem"][aria-label="Checkbox"]');
      TinyAssertions.assertContent(editor, `<div>Noneditable content</div>\n<div contenteditable="true">Editable${box(unchecked)} content</div>`);
    });
  });
});
