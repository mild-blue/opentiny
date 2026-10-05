import { UiFinder, Waiter } from '@ephox/agar';
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

  const checkboxGlyphs = [ '\u2610', '\u2612', '\u2611' ];
  const whiteSquare = '\u25A1';

  const getItemValues = (): string[] =>
    Arr.map(UiFinder.findAllIn(SugarBody.body(), '[role="dialog"] .tox-collection__item'), (item) => Attribute.get(item, 'data-collection-item-value') ?? '');

  const pOpenTab = async (editor: Editor, name: string, assertValues: (values: string[]) => void) => {
    TinyUiActions.clickOnUi(editor, `[role="dialog"] .tox-dialog__body-nav-item:contains("${name}")`);
    await Waiter.pTryUntil(`Wait for the ${name} tab`, () => assertValues(getItemValues()));
  };

  it('The checkbox glyphs have their own first category and come first in All', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Special character"]');
    await TinyUiActions.pWaitForDialog(editor);

    const tabs = Arr.map(UiFinder.findAllIn(SugarBody.body(), '[role="dialog"] .tox-dialog__body-nav-item'), TextContent.get);
    assert.deepEqual(tabs.slice(0, 3), [ 'All', 'Checkboxes', 'Currency' ]);
    assert.deepEqual(getItemValues().slice(0, 3), checkboxGlyphs, 'All starts with the checkbox glyphs');

    await pOpenTab(editor, 'Checkboxes', (values) => assert.deepEqual(values, checkboxGlyphs));
    // The look-alike white square is not a checkbox, so it stays in Other
    await pOpenTab(editor, 'Other', (values) => {
      assert.equal(values[0], whiteSquare);
      assert.isEmpty(Arr.filter(values, (value) => Arr.contains(checkboxGlyphs, value)));
    });

    TinyUiActions.closeDialog(editor);
  });
});
