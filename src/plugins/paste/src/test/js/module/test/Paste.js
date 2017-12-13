import { Step } from '@ephox/agar';
import MockDataTransfer from 'tinymce/plugins/paste/test/MockDataTransfer';

var sPaste = function (editor, data) {
  return Step.sync(function () {
    var dataTransfer = MockDataTransfer.create(data);
    editor.fire('paste', { clipboardData: dataTransfer });
  });
};

export default <any> {
  sPaste: sPaste
};