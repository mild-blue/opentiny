import { UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/checkbox/Plugin';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.checkbox.ChecklistTest', () => {
  const unchecked = '\u2610';
  const checked = '\u2612';
  const box = (glyph: string) => `<span class="mce-checkbox">${glyph}</span>`;
  const item = (text: string, glyph: string = unchecked) => `<li>${box(glyph)}&nbsp;${text}</li>`;
  const checklist = (...items: string[]) => `<ul class="mce-checklist" style="list-style-type: none;">\n${items.join('\n')}\n</ul>`;

  describe('With the lists plugin', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      plugins: 'checkbox lists',
      toolbar: 'checklist bullist',
      base_url: '/project/tinymce/js/tinymce'
    }, [ Plugin, ListsPlugin ], true);

    const assertButtonActive = (active: boolean) =>
      UiFinder.exists(SugarBody.body(), `button[aria-label="Checklist"][aria-pressed="${active}"]`);

    it('Toggles a paragraph into a checklist and back', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Checklist"]');
      TinyAssertions.assertContent(editor, checklist(item('a')));
      assertButtonActive(true);

      TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Checklist"]');
      TinyAssertions.assertContent(editor, '<p>a</p>');
      assertButtonActive(false);
    });

    it('Turns every selected paragraph into a checklist item, in one undo level', () => {
      const editor = hook.editor();
      editor.resetContent('<p>a</p><p>b</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 1, 0 ], 1);
      editor.execCommand('mceToggleChecklist');
      TinyAssertions.assertContent(editor, checklist(item('a'), item('b')));
      editor.undoManager.undo();
      TinyAssertions.assertContent(editor, '<p>a</p>\n<p>b</p>');
    });

    it('Converts a whole bullet list, keeping checkboxes that are already there', () => {
      const editor = hook.editor();
      editor.setContent(`<ul><li>a</li><li>${box(checked)}&nbsp;b</li></ul>`);
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      editor.execCommand('mceToggleChecklist');
      TinyAssertions.assertContent(editor, checklist(item('a'), item('b', checked)));
    });

    it('An empty paragraph becomes an item with the caret after its checkbox', () => {
      const editor = hook.editor();
      editor.setContent('<p></p>');
      TinySelections.setCursor(editor, [ 0 ], 0);
      editor.execCommand('mceToggleChecklist');
      editor.insertContent('a');
      // Text typed after the separating non-breaking space turns it into a normal one
      TinyAssertions.assertContent(editor, checklist(`<li>${box(unchecked)} a</li>`));
    });
  });

  describe('Without the lists plugin', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      plugins: 'checkbox',
      base_url: '/project/tinymce/js/tinymce'
    }, [ Plugin ]);

    it('There is no checklist button, menu item or command', () => {
      const editor = hook.editor();
      const registry = editor.ui.registry.getAll();
      assert.isUndefined(registry.buttons.checklist);
      assert.isUndefined(registry.menuItems.checklist);
      assert.isFalse(editor.queryCommandSupported('mceToggleChecklist'));
    });
  });
});
