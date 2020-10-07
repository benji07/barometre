import '../css/main.scss';

import $ from 'jquery';
import 'select2';
import Map from './map';
import './chart';
import './tablesorter';
import 'bootstrap-sass/assets/javascripts/bootstrap/dropdown';
import 'bootstrap-sass/assets/javascripts/bootstrap/transition';
import 'bootstrap-sass/assets/javascripts/bootstrap/collapse';

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

new Map('#map');
