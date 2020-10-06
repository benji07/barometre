import '../css/app.css';

import $ from 'jquery';
import 'select2';
import 'tablesorter/js/jquery.tablesorter';
import 'tablesorter/js/jquery.tablesorter.widgets';
import * as d3 from 'd3';
global.$ = $;
global.d3 = d3;
import Highcharts from 'highcharts';
global.Highcharts = Highcharts;
import 'highchartTable/jquery.highchartTable';
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

$.extend($.tablesorter.themes.bootstrap, {
    // these classes are added to the table. To see other table classes available,
    // look here: http://twitter.github.com/bootstrap/base-css.html#tables
    table      : '',
    caption    : 'caption',
    header     : 'bootstrap-header', // give the header a gradient background
    footerRow  : '',
    footerCells: '',
    icons      : '', // add "icon-white" to make them white; this icon class is added to the <i> in the header
    sortNone   : 'icon-unsorted icon icon-chevron-up',
    sortAsc    : 'icon-sorted icon icon-chevron-up ',     // includes classes for Bootstrap v2 & v3
    sortDesc   : 'icon-sorted icon icon-chevron-down ', // includes classes for Bootstrap v2 & v3
    active     : '', // applied when column is sorted
    hover      : '', // use custom css here - bootstrap class may not override it
    filterRow  : '', // filter row class
    even       : '', // odd row zebra striping
    odd        : ''  // even row zebra striping
});


$('table.tablesorter').tablesorter({
    theme : "bootstrap",
    headerTemplate : '{icon} {content}',
    widgets : [ "uitheme"]
});

$('table.highchart')
    .bind('highchartTable.beforeRender', function (event, highChartConfig) {

        if ($(this).hasClass('highchart-emoticon')) {
            var icons = $(this).data('icons');

            if ($(this).data('graph-type') !== 'column') {
                highChartConfig.plotOptions.series = {
                    dataLabels: {
                        useHTML: true,
                        formatter : function () {
                            var defaultDatalabel = '<b>' + this.point.name + '</b> : ' + this.percentage.toFixed(2) + '%';
                            if (typeof icons[this.point.name] === 'undefined') {
                                return defaultDatalabel;
                            }
                            var infos = icons[this.point.name];
                            return '<i class="icon ' + infos.class + '" style="font-size: ' + infos.size + '"></i> ' + defaultDatalabel;
                        }
                    }
                };
            } else {
                highChartConfig.xAxis.labels.useHTML = true;
                highChartConfig.xAxis.labels.formatter = function () {
                    var trimmedValue = this.value.trim();
                    var defaultDatalabel = trimmedValue;
                    if (typeof icons[trimmedValue] === 'undefined') {
                        return defaultDatalabel;
                    }
                    var infos = icons[trimmedValue];
                    return '<i class="icon ' + infos.class + '" style="font-size: ' + infos.size + '"></i> ' + defaultDatalabel;
                };
            }
        }

        if ($(this).hasClass('highchart-value-and-percent')) {
            highChartConfig.plotOptions.series = {
                dataLabels: {
                    useHTML: true,
                    formatter : function () {
                        return '<b>' + this.point.name + '</b> : ' + this.y + ' (' + this.percentage.toFixed(2) + '%)';
                    }
                }
            };
        }

        if ($(this).hasClass('abstract-distribution-evolution')) {
            highChartConfig.plotOptions.series.dataLabels = {
                useHTML: true,
                formatter : function () {
                    if (typeof this.percentage === 'undefined') {
                        return;
                    }

                    if (this.percentage < 10) {
                        return;
                    }

                    return '<b>' + this.series.name + '</b> : <br />' + ' ' + this.percentage.toFixed(2) + '%';
                }
            };
        }

        if ($(this).data('graph-datalabels-format')) {
            highChartConfig.plotOptions.series.dataLabels = {
                useHTML: true,
                format: $(this).data('graph-datalabels-format')
            };
        }

        if ($(this).data('graph-tooltip-disabled') === 1) {
            highChartConfig.tooltip = {
                enabled: false
            };
        }

        highChartConfig.colors[0] = '#4C6EAF';
        var align = $(this).data('graph-xaxis-labels-align');
        if (align !== undefined) {
            highChartConfig.xAxis.labels.align = align;
        }
    })
    .highchartTable();

// map
(function () {
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("visibility", "hidden");

    function init() {

        if (1 !== $('#map').length) {
            return;
        }


        var svg = d3.select("#map svg");

        var gfg = d3.geoAlbers()
            .rotate([-4, 0])
            .center([2.6, 46.5])
            .parallels([40, 50])
            .scale(2600)
            .translate([380, 250])
        ;

        svg = d3.select("#map svg")
            .append("g");

        var bg = svg.append("g")
            .attr("id", "background");

        svg.insert("g", "#background")
            .attr("id", "data_layer");

        var dataLayer = svg.select('#data_layer');
        dataLayer.attr("class", 'Blues');

        d3
            .json(getTypeInfos().file)
            .then(function (data) {
                bg.selectAll("path")
                    .data(data.features)
                    .enter().append("path")
                    .attr("d", d3.geoPath(gfg));
                dataLayer.selectAll("path")
                    .data(data.features)
                    .enter().append("path")
                    .attr("d", d3.geoPath(gfg));

                recomputeValues();
            })
        ;
    }

    function getTypeInfos()
    {
        var mapType = $('#map-table').data("map-type");

        switch (mapType) {
            case 'region':
                return {
                    file: "/geofla/regions_2016.geojson",

                    keyCode: "code",
                    keyNom: "nom"
                };
            case 'departement':
                return {
                    file: "/geofla/departement.json",
                    keyCode: "CODE_DEPT",
                    keyNom: "NOM_DEPT"
                };
            default:
                throw "unknown map type";
        }
    }

    function recomputeValues() {
        var values = getValues();
        var typeInfos = getTypeInfos();
        d3.selectAll("#data_layer path")
            .on("mouseover", function (d) {
                var value = parseInt(values[d.properties[typeInfos.keyCode]]);
                if (isNaN(value)) {
                    value = 0;
                }
                tooltip.text(d.properties[typeInfos.keyNom] + " / " + value);
                return tooltip.style("visibility", "visible");
            })
            .on("mousemove", function () {
                return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
            })
            .on("mouseout", function () {
                return tooltip.style("visibility", "hidden");
            })
            .datum(function (d) {
                d.value = parseInt(values[d.properties[typeInfos.keyCode]]);
                if (isNaN(d.value)) {
                    d.value = 0;
                }
                return d;
            });
        recomputeScale();
    }

    function getValues() {
        var values = {};
        $('#map-table').find('tr').each(function () {
            var dep = $('td', this).first().text();
            var nb = $('td', this).last().text();
            if (0 === dep.length) {
                return;
            }
            values[dep] = nb.replace(/\s/g, '');
        });

        return values;
    }

    function recomputeScale() {
        var p = d3.selectAll("#data_layer path");
        var values = p.data().map(function (d) { return d.value; });
        var scale = buildScale(values, 9, 'quantize');
        p.attr("class", function (d) { return scale(d.value); });
    }

    function buildScale(domain, buckets) {
        var legendClass = function (n) { return "q" + n + "-" + buckets; };
        var minmax = d3.extent(domain);
        var min = minmax[0];
        var max = minmax[1];
        var a = d3.range(buckets).map(legendClass);
        var scale, q;
        scale = d3.scaleQuantize().range(a).domain([min, max]);
        q = d3.range(buckets + 1).map(function (n) {
            return min + (max - min) * (n / buckets);
        });
        q = q.map(function (n) { return n.toPrecision(3); });

        return scale;
    }

    init();
})();
