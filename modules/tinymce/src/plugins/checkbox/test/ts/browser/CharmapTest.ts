import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import CharmapPlugin from 'tinymce/plugins/charmap/Plugin';
import Plugin from 'tinymce/plugins/checkbox/Plugin';

describe('browser.tinymce.plugins.checkbox.CharmapTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'checkbox charmap',
    toolbar: 'charmap',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, CharmapPlugin ], true);

  const unchecked = '\u2610';
  const checked = '\u2612';
  const box = (glyph: string) => `<span class="mce-checkbox">${glyph}</span>`;

  const pPickFromCharmap = async (editor: Editor, glyph: string) => {
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Special character"]');
    await TinyUiActions.pWaitForDialog(editor);
    TinyUiActions.clickOnUi(editor, `.tox-collection__item[data-collection-item-value="${glyph}"]`);
    await Waiter.pTryUntil('Wait for the dialog to close', () => UiFinder.notExists(SugarBody.body(), '.tox-dialog'));
  };

  it('The ballot boxes picked from Special characters are checkboxes', async () => {
    const editor = hook.editor();
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    await pPickFromCharmap(editor, unchecked);
    TinyAssertions.assertContent(editor, `<p>a${box(unchecked)}</p>`);
    await pPickFromCharmap(editor, checked);
    TinyAssertions.assertContent(editor, `<p>a${box(unchecked)}${box(checked)}</p>`);

    Mouse.trueClick(UiFinder.findIn<HTMLElement>(TinyDom.body(editor), 'span.mce-checkbox').getOrDie());
    TinyAssertions.assertContent(editor, `<p>a${box(checked)}${box(checked)}</p>`);
  });
});
