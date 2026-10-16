import { RealKeys, RealMouse } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/checkbox/Plugin';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';

describe('webdriver.tinymce.plugins.checkbox.ClickCaretTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'checkbox lists',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, ListsPlugin ], true);

  const unchecked = '\u2610';
  const checked = '\u2612';
  const box = (glyph: string) => `<span class="mce-checkbox">${glyph}</span>`;

  // A new checklist item, with the caret elsewhere
  const setUpEmptyItem = (editor: Editor) => {
    editor.setContent('<p>other</p><p></p>');
    editor.selection.setCursorLocation(editor.dom.select('p')[1], 0);
    editor.execCommand('mceToggleChecklist');
    editor.selection.setCursorLocation(editor.dom.select('p')[0].firstChild as Text, 2);
  };

  const assertTypedAfterSpace = async (editor: Editor, glyph: string) => {
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('Z') ]);
    TinyAssertions.assertContent(editor, `<p>other</p>\n<ul class="mce-checklist" style="list-style-type: none;">\n<li>${box(glyph)} Z</li>\n</ul>`);
  };

  it('Typing after a click on an empty checklist item goes after the space', async () => {
    const editor = hook.editor();
    setUpEmptyItem(editor);
    await RealMouse.pClickOn('iframe => ul > li');
    await assertTypedAfterSpace(editor, unchecked);
  });

  it('Typing after a click on the checkbox of an empty checklist item goes after the space', async () => {
    const editor = hook.editor();
    setUpEmptyItem(editor);
    await RealMouse.pClickOn('iframe => ul > li > span.mce-checkbox');
    await assertTypedAfterSpace(editor, checked);
  });
});
