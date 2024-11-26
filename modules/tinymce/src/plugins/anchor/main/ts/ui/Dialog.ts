import Editor from 'tinymce/core/api/Editor';

import * as Anchor from '../core/Anchor';
import I18n from "tinymce/core/api/util/I18n";

const insertAnchor = (editor: Editor, newId: string): boolean => {
  if (!Anchor.isValidId(newId)) {
    editor.windowManager.alert(
      'ID should start with a letter, followed only by letters, numbers, dashes, dots, colons or underscores.'
    );
    return false;
  } else {
    Anchor.insert(editor, newId);
    return true;
  }
};

const open = (editor: Editor): void => {
  const currentId = Anchor.getId(editor);

  editor.windowManager.open({
    title: 'Anchor',
    size: 'normal',
    body: {
      type: 'panel',
      items: [
        {
          type: 'htmlpanel',
          html: '<p style="font-size: 14px; margin-bottom: 10px;">' +
            I18n.translate('The anchor tool is used to create a link that allows the user to jump to a specific part of the document marked by the anchor. For example, you can link to an image or a specific section of text (e.g., a heading or a paragraph)') +
            '<br><br>' +
            I18n.translate('Enter an anchor identifier in the "ID" field (e.g., "anchor1") > click Save > Insert > Link > select the anchor in the "Anchors" field > the "Link URL" and "Link Text" fields will auto-fill > adjust the "Link Title" as needed.') +
            '</p>'
        },
        {
          name: 'id',
          type: 'input',
          label: 'ID',
          placeholder: 'example'
        }
      ]
    },
    buttons: [
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel'
      },
      {
        type: 'submit',
        name: 'save',
        text: 'Save',
        primary: true
      }
    ],
    initialData: {
      id: currentId
    },
    onSubmit: (api) => {
      if (insertAnchor(editor, api.getData().id)) { // TODO we need a better way to do validation
        api.close();
      }
    }
  });
};

export {
  open
};
