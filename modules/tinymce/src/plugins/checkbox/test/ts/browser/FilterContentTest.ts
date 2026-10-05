import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/checkbox/Plugin';

describe('browser.tinymce.plugins.checkbox.FilterContentTest', () => {
  const unchecked = '\u2610';
  const box = (glyph: string) => `<span class="mce-checkbox">${glyph}</span>`;

  describe('Fresh editor', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      plugins: 'checkbox',
      base_url: '/project/tinymce/js/tinymce'
    }, [ Plugin ]);

    // The text filter is only registered once content with a glyph is set, so this must run first
    it('Wraps a glyph given as a character reference in the first content that has one', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      editor.insertContent(' &#9744; b');
      TinyAssertions.assertContent(editor, `<p>a ${box(unchecked)} b</p>`);
    });
  });

  describe('valid_classes without mce-checkbox', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      plugins: 'checkbox',
      valid_classes: 'highlight',
      base_url: '/project/tinymce/js/tinymce'
    }, [ Plugin ]);

    it('Never leaves a contenteditable="false" span without the checkbox class', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      editor.execCommand('mceInsertCheckbox');
      assert.notInclude(editor.getContent(), 'contenteditable');
      assert.lengthOf(editor.dom.select('[contenteditable="false"]:not(.mce-checkbox)'), 0);
    });
  });
});
