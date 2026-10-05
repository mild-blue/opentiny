import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'checkbox table charmap code',
  toolbar: 'checkbox | table charmap | undo redo | code',
  menu: { insert: { title: 'Insert', items: 'checkbox charmap | inserttable' }},
  height: 600
});

tinymce.init({
  selector: 'div.tinymce',
  plugins: 'checkbox code',
  toolbar: 'checkbox | undo redo | code',
  editable_root: false,
  editable_class: 'editable',
  height: 300
});

export {};
