import '../css/app.css';

import $ from 'jquery';
import 'select2';
import 'tablesorter';
// require('tablesorter/js/jquery.tablesorter.widgets');

$.fn.select2.defaults.set('language', require('select2/src/js/select2/i18n/fr'));

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) === false) {
    $('.select2').select2({
        closeOnSelect: false,
        placeholder: "Choisir une valeur",
        theme: "bootstrap",
        width: '100%'
    });
}

$('.filter-toggler', '.form-group').click(function (e) {
    var parentGroup = $(this).parents('.form-group');
    $('.form-row-content', parentGroup).toggle();
    $('.glyphicon', parentGroup)
        .toggleClass('glyphicon-chevron-down')
        .toggleClass('glyphicon-chevron-up')
    ;
    e.preventDefault();
});

// $.extend($.tablesorter.themes.bootstrap, {
//     // these classes are added to the table. To see other table classes available,
//     // look here: http://twitter.github.com/bootstrap/base-css.html#tables
//     table      : '',
//     caption    : 'caption',
//     header     : 'bootstrap-header', // give the header a gradient background
//     footerRow  : '',
//     footerCells: '',
//     icons      : '', // add "icon-white" to make them white; this icon class is added to the <i> in the header
//     sortNone   : 'icon-unsorted icon icon-chevron-up',
//     sortAsc    : 'icon-sorted icon icon-chevron-up ',     // includes classes for Bootstrap v2 & v3
//     sortDesc   : 'icon-sorted icon icon-chevron-down ', // includes classes for Bootstrap v2 & v3
//     active     : '', // applied when column is sorted
//     hover      : '', // use custom css here - bootstrap class may not override it
//     filterRow  : '', // filter row class
//     even       : '', // odd row zebra striping
//     odd        : ''  // even row zebra striping
// });


$('table.tablesorter').tablesorter({
    theme : "bootstrap",
    headerTemplate : '{icon} {content}',
    widgets : [ "uitheme"]
});
