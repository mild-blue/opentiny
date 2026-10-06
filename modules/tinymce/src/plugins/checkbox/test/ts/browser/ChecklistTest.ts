import { Keys, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import AdvListPlugin from 'tinymce/plugins/advlist/Plugin';
import Plugin from 'tinymce/plugins/checkbox/Plugin';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.checkbox.ChecklistTest', () => {
  const unchecked = '\u2610';
  const checked = '\u2612';
  const box = (glyph: string) => `<span class="mce-checkbox">${glyph}</span>`;
  const item = (text: string, glyph: string = unchecked) => `<li>${box(glyph)}&nbsp;${text}</li>`;
  const checklist = (...items: string[]) => `<ul class="mce-checklist" style="list-style-type: none;">\n${items.join('\n')}\n</ul>`;

  // Core puts a caret container next to the contenteditable="false" checkbox, so find the text after it
  const setCursorInItem = (editor: Editor, index: number, offset: number) => {
    const checkbox = editor.dom.select('li span.mce-checkbox')[index];
    editor.selection.setCursorLocation(checkbox.nextSibling as Text, offset);
  };

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

    it('Enter at the end of an item starts a new item with an unchecked checkbox', () => {
      const editor = hook.editor();
      editor.setContent(checklist(item('a', checked)));
      setCursorInItem(editor, 0, 2);
      TinyContentActions.keystroke(editor, Keys.enter());
      editor.insertContent('b');
      TinyAssertions.assertContent(editor, checklist(item('a', checked), `<li>${box(unchecked)} b</li>`));
    });

    it('Enter in the middle of an item splits it, and both halves have a checkbox', () => {
      const editor = hook.editor();
      editor.setContent(checklist(item('ab', checked)));
      setCursorInItem(editor, 0, 2);
      TinyContentActions.keystroke(editor, Keys.enter());
      TinyAssertions.assertContent(editor, checklist(item('a', checked), item('b')));
    });

    it('Enter on an item holding only its checkbox ends the list, in one undo level', () => {
      const editor = hook.editor();
      editor.resetContent(checklist(item('a')));
      setCursorInItem(editor, 0, 2);
      TinyContentActions.keystroke(editor, Keys.enter());
      TinyAssertions.assertContent(editor, checklist(item('a'), item('')));

      TinyContentActions.keystroke(editor, Keys.enter());
      TinyAssertions.assertContent(editor, `${checklist(item('a'))}\n<p>&nbsp;</p>`);

      editor.undoManager.undo();
      TinyAssertions.assertContent(editor, checklist(item('a'), item('')));
    });
  });

  describe('With the advlist plugin', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      plugins: 'advlist checkbox lists',
      toolbar: 'bullist',
      base_url: '/project/tinymce/js/tinymce'
    }, [ AdvListPlugin, Plugin, ListsPlugin ], true);

    const pOpenBulletStyles = async (editor: Editor) => {
      TinyUiActions.clickOnToolbar(editor, '[aria-label="Bullet list"] > .tox-tbtn + .tox-split-button__chevron');
      await TinyUiActions.pWaitForUi(editor, '.tox-menu.tox-selected-menu');
    };

    const checklistStyle = 'div.tox-selected-menu[role="menu"] div[aria-label="Checklist"]';

    it('Offers the checklist among the bullet styles and toggles it from there', async () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      await pOpenBulletStyles(editor);
      UiFinder.exists(SugarBody.body(), `${checklistStyle}[aria-checked="false"]`);
      TinyUiActions.clickOnUi(editor, checklistStyle);
      TinyAssertions.assertContent(editor, checklist(item('a')));

      await pOpenBulletStyles(editor);
      UiFinder.exists(SugarBody.body(), `${checklistStyle}[aria-checked="true"]`);
      TinyUiActions.clickOnUi(editor, checklistStyle);
      TinyAssertions.assertContent(editor, '<p>a</p>');
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
