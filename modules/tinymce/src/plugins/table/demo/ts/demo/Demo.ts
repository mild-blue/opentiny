import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

tinymce.init({
  selector: 'div.tinymce',
  plugins: 'table',
  toolbar: 'table tableprops tablecellprops tablerowprops | tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol | tablecutrow tablecopyrow tablepasterowbefore tablepasterowafter |' +
  ' tableclass tablecellclass | tablecellvalign | tablecellborderwidth tablecellborderstyle | tablecaption | tablecellbackgroundcolor tablecellbordercolor | tablerowheader tablecolheader',
  media_dimensions: false,
  table_class_list: [
    { title: 'None', value: '' },
    { title: 'Dog', value: 'dog' },
    { title: 'Cat', value: 'cat' }
  ],
  table_row_class_list: [
    { title: 'None', value: '' },
    { title: 'Fish', value: 'fish' },
    { title: 'Mouse', value: 'mouse' }
  ],
  table_cell_class_list: [
    { title: 'None', value: '' },
    { title: 'Bird', value: 'bird' },
    { title: 'Snake', value: 'snake' }
  ],
  // table_style_by_css: false,
  // table grid TBD
  table_grid: true,
  // table_column_resizing: 'preservetable',
  // table_sizing_mode: 'fixed',
  // table_advtab: true,
  // table_cell_advtab: false,
  // table_row_advtab: false,
  // media_live_embeds: false,
  // media_url_resolver: function (data, resolve) {
  // resolve({
  //   html: '<iframe src="' + data.url + '" width="560" height="314" allowfullscreen="allowfullscreen"></iframe>'});
  // },
  height: 600,
  table_border_styles:[
    { title: 'Solid', value: 'solid' },
    { title: 'Dotted', value: 'dotted' },
    { title: 'Dashed', value: 'dashed' }
    // None option is automatically added if no default border style is defined and is missing from defined options
  ],

  table_default_styles: {
    // every new table will have a border of 1px solid black
    "border-color": "black",
    "border-style": "solid",
    width: "100%",
  },
  content_style: 'td[data-mce-selected], th[data-mce-selected] { background-color: #2276d2 !important; }' + '.cat { border-color: green; color: red; background-color: }'
});

export {};
