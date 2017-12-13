import { GeneralSteps } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import Env from 'tinymce/core/Env';
import PastePlugin from 'tinymce/plugins/paste/Plugin';
import Paste from 'tinymce/plugins/paste/test/Paste';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('Browser Test: .PasteStylesTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  ModernTheme();
  PastePlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    var tinyApis = TinyApis(editor);
    var steps = Env.webkit ? [
      Logger.t('Paste span with encoded style attribute, paste_webkit_styles: font-family',
        GeneralSteps.sequence([
          tinyApis.sSetSetting('paste_webkit_styles', 'font-family'),
          tinyApis.sSetContent('<p>test</p>'),
          tinyApis.sSetSelection([0, 0], 0, [0, 0], 4),
          Paste.sPaste(editor, { 'text/html': '<span style="font-family: &quot;a b&quot;;color:green;">b</span>' }),
          tinyApis.sAssertContent('<p><span style="font-family: \'a b\';">b</span></p>')
        ])
      ),

      Logger.t('Paste span with encoded style attribute, paste_webkit_styles: all',
        GeneralSteps.sequence([
          tinyApis.sSetSetting('paste_webkit_styles', 'all'),
          tinyApis.sSetContent('<p>test</p>'),
          tinyApis.sSetSelection([0, 0], 0, [0, 0], 4),
          Paste.sPaste(editor, { 'text/html': '<span style="font-family: &quot;a b&quot;; color: green;">b</span>' }),
          tinyApis.sAssertContent('<p><span style="font-family: \'a b\'; color: green;">b</span></p>')
        ])
      ),

      Logger.t('Paste span with encoded style attribute, paste_webkit_styles: none',
        GeneralSteps.sequence([
          tinyApis.sSetSetting('paste_webkit_styles', 'none'),
          tinyApis.sSetContent('<p>test</p>'),
          tinyApis.sSetSelection([0, 0], 0, [0, 0], 4),
          Paste.sPaste(editor, { 'text/html': '<span style="font-family: &quot;a b&quot;;">b</span>' }),
          tinyApis.sAssertContent('<p>b</p>')
        ])
      ),

      Logger.t('Paste span with encoded style attribute, paste_remove_styles_if_webkit: false',
        GeneralSteps.sequence([
          tinyApis.sSetSetting('paste_remove_styles_if_webkit', false),
          tinyApis.sSetContent('<p>test</p>'),
          tinyApis.sSetSelection([0, 0], 0, [0, 0], 4),
          Paste.sPaste(editor, { 'text/html': '<span style="font-family: &quot;a b&quot;;">b</span>' }),
          tinyApis.sAssertContent('<p><span style="font-family: \'a b\';">b</span></p>')
        ])
      )
    ] : [];

    Pipeline.async({}, steps, onSuccess, onFailure);
  }, {
    plugins: 'paste',
    toolbar: '',
    valid_styles: 'font-family,color',
    skin_url: '/project/src/skins/lightgray/dist/lightgray'
  }, success, failure);
});

