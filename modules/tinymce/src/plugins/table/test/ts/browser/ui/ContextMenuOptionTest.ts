import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

describe('browser.tinymce.plugins.table.ContextMenuOptionTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'table',
    contextmenu: 'table',
    table_contextmenu: [ 'tableprops', 'deletetable' ],
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  const getTableContextMenuItems = (editor: Editor) =>
    editor.ui.registry.getAll().contextMenus.table.update(editor.selection.getNode());

  it('returns the configured table_contextmenu items inside a table', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td>a</td></tr></tbody></table>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
    assert.equal(getTableContextMenuItems(editor), 'tableprops deletetable');
  });

  it('returns an empty menu outside a table even when table_contextmenu is set', () => {
    const editor = hook.editor();
    editor.setContent('<p>text</p><table><tbody><tr><td>a</td></tr></tbody></table>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    assert.equal(getTableContextMenuItems(editor), '');
  });

  it('returns an empty menu on a link outside a table even when table_contextmenu is set', () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="https://example.com">link</a></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
    assert.equal(getTableContextMenuItems(editor), '');
  });
});
