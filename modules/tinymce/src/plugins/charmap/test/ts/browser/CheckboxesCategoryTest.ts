import { UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Attribute, SugarBody, TextContent } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/charmap/Plugin';

describe('browser.tinymce.plugins.charmap.CheckboxesCategoryTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'charmap',
    toolbar: 'charmap',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  it('The checkbox glyphs are the first category and the first characters of All', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Special character"]');
    await TinyUiActions.pWaitForDialog(editor);

    const tabs = Arr.map(UiFinder.findAllIn(SugarBody.body(), '[role="dialog"] .tox-dialog__body-nav-item'), TextContent.get);
    assert.deepEqual(tabs.slice(0, 3), [ 'All', 'Checkboxes', 'Currency' ]);

    const items = UiFinder.findAllIn(SugarBody.body(), '[role="dialog"] .tox-collection__item');
    const firstValues = Arr.map(items.slice(0, 4), (item) => Attribute.get(item, 'data-collection-item-value'));
    assert.deepEqual(firstValues, [ '\u2610', '\u2612', '\u2611', '\u25A1' ]);

    TinyUiActions.closeDialog(editor);
  });
});
