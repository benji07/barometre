import * as d3 from 'd3';
import $ from "jquery";

export default class RegionMap {
    constructor(selector) {
        this.container = d3.select(selector);

        if (this.container.empty()) {
            return;
        }

        this.tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("visibility", "hidden");

        this.loadMap();
    }

    loadMap() {
        const path = d3.geoAlbers()
            .rotate([-4, 0])
            .center([2.6, 46.5])
            .parallels([40, 50])
            .scale(2600)
            .translate([380, 250])
        ;

        const svg = this.container.select("svg").append("g");
        const bg = svg.append("g").attr("id", "background");

        svg.insert("g", "#background").attr("id", "data_layer");

        const dataLayer = svg.select('#data_layer');
        dataLayer.attr("class", 'Blues');

        d3
            .json(this.getTypeInfos().file)
            .then(function (data) {
                bg.selectAll("path")
                    .data(data.features)
                    .enter().append("path")
                    .attr("d", d3.geoPath(path));
                dataLayer.selectAll("path")
                    .data(data.features)
                    .enter().append("path")
                    .attr("d", d3.geoPath(path));
            })
            .then(() => this.recomputeValues())
        ;
    }

    getTypeInfos()
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

    recomputeValues() {
        var values = this.getValues();
        var typeInfos = this.getTypeInfos();

        d3.selectAll("#data_layer path")
            .on("mouseover", (d) => {
                var value = parseInt(values[d.properties[typeInfos.keyCode]]);
                if (isNaN(value)) {
                    value = 0;
                }
                this.tooltip.text(d.properties[typeInfos.keyNom] + " / " + value);
                return this.tooltip.style("visibility", "visible");
            })
            .on("mousemove", () => {
                return this.tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
            })
            .on("mouseout", () =>  {
                return this.tooltip.style("visibility", "hidden");
            })
            .datum(function (d) {
                d.value = parseInt(values[d.properties[typeInfos.keyCode]]);
                if (isNaN(d.value)) {
                    d.value = 0;
                }
                return d;
            });
        this.recomputeScale();
    }

    getValues() {
        let values = {};
        $('#map-table').find('tr').each(function () {
            const dep = $('td', this).first().text();
            const nb = $('td', this).last().text();
            if (0 === dep.length) {
                return;
            }
            values[dep] = nb.replace(/\s/g, '');
        });

        return values;
    }

    recomputeScale() {
        const p = d3.selectAll("#data_layer path");
        const values = p.data().map(function (d) {
            return d.value;
        });
        const scale = this.buildScale(values, 9, 'quantize');

        p.attr("class", function (d) { return scale(d.value); });
    }

    buildScale(domain, buckets) {
        const [min, max] = d3.extent(domain);

        const a = d3.range(buckets).map(function (n) {
            return "q" + n + "-" + buckets;
        });

        let scale, q;

        scale = d3.scaleQuantize().range(a).domain([min, max]);

        q = d3.range(buckets + 1).map(function (n) {
            return min + (max - min) * (n / buckets);
        });

        q.map(function (n) { return n.toPrecision(3); });

        return scale;
    }
}
