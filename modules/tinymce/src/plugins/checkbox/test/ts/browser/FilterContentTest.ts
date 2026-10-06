import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/checkbox/Plugin';

describe('browser.tinymce.plugins.checkbox.FilterContentTest', () => {
  const unchecked = '\u2610';
  const box = (glyph: string) => `<span class="mce-checkbox">${glyph}</span>`;

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

  // Saving then loading again must not change the content, or every save would nest it deeper
  const assertStableRoundTrip = (editor: Editor, html: string) => {
    editor.setContent(html);
    const saved = editor.getContent();
    editor.setContent(saved);
    TinyAssertions.assertContent(editor, saved);
    editor.setContent(saved);
    TinyAssertions.assertContent(editor, saved);
  };

  describe('extended_valid_elements that drops the class from spans', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      plugins: 'checkbox',
      extended_valid_elements: 'span[style]',
      base_url: '/project/tinymce/js/tinymce'
    }, [ Plugin ]);

    it('Leaves glyphs as text, and content is stable across saves', () => {
      const editor = hook.editor();
      assertStableRoundTrip(editor, `<p>${unchecked} a</p>`);
      assertStableRoundTrip(editor, `<p>${box(unchecked)} a</p>`);
      assert.lengthOf(editor.dom.select('[contenteditable="false"]'), 0);
    });
  });

  describe('valid_classes without mce-checkbox, round trip', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      plugins: 'checkbox',
      valid_classes: 'highlight',
      base_url: '/project/tinymce/js/tinymce'
    }, [ Plugin ]);

    it('Leaves glyphs as text, and content is stable across saves', () => {
      const editor = hook.editor();
      assertStableRoundTrip(editor, `<p>${unchecked} a</p>`);
      assertStableRoundTrip(editor, `<p>${box(unchecked)} a</p>`);
    });
  });
});
