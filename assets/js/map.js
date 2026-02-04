import * as d3 from 'd3';

let svg;
let path;

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("visibility", "hidden");

function init() {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        return;
    }

    // Projection Albers pour la France (API D3 v7)
    const projection = d3.geoAlbers()
        .center([2.6, 46.5])
        .parallels([44, 49])
        .scale(2700)
        .translate([250, 250]);

    path = d3.geoPath().projection(projection);

    svg = d3.select("#map svg").append("g");

    const bg = svg.append("g").attr("id", "background");

    svg.insert("g", "#background").attr("id", "data_layer");

    const dataLayer = svg.select('#data_layer');
    dataLayer.attr("class", 'Blues');

    // API Promise (D3 v7)
    d3.json(getTypeInfos().file).then(json => {
        bg.selectAll("path")
            .data(json.features)
            .enter().append("path")
            .attr("d", path);

        dataLayer.selectAll("path")
            .data(json.features)
            .enter().append("path")
            .attr("d", path);

        recomputeValues();
    });
}

function getTypeInfos() {
    const mapTable = document.getElementById('map-table');
    const mapType = mapTable?.dataset.mapType;

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
            throw new Error("unknown map type");
    }
}

function recomputeValues() {
    const values = getValues();
    const typeInfos = getTypeInfos();

    d3.selectAll("#data_layer path")
        // Event handlers avec argument event (D3 v7)
        .on("mouseover", function(event, d) {
            let value = parseInt(values[d.properties[typeInfos.keyCode]]) || 0;
            tooltip.text(d.properties[typeInfos.keyNom] + " / " + value);
            tooltip.style("visibility", "visible");
        })
        .on("mousemove", function(event) {
            tooltip
                .style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        })
        .datum(function(d) {
            d.value = parseInt(values[d.properties[typeInfos.keyCode]]) || 0;
            return d;
        });

    recomputeScale();
}

function getValues() {
    const values = {};
    document.querySelectorAll('#map-table tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
            const dep = cells[0].textContent;
            const nb = cells[cells.length - 1].textContent.replace(/\s/g, '');
            if (dep) {
                values[dep] = nb;
            }
        }
    });
    return values;
}

function recomputeScale() {
    const p = d3.selectAll("#data_layer path");
    const values = p.data().map(d => d.value);
    const scale = buildScale(values, 9);
    p.attr("class", d => scale(d.value));
}

function buildScale(domain, buckets) {
    const legendClass = n => `q${n}-${buckets}`;
    const [min, max] = d3.extent(domain);
    const classes = d3.range(buckets).map(legendClass);
    return d3.scaleQuantize().range(classes).domain([min, max]);
}

document.addEventListener('DOMContentLoaded', init);

export default {};
