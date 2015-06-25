# data-reduction

A utility for reducing the size of data sets for visualization.

The main goal of the this package is to unifying the aggregation computation behind visualizations including [Histogram](http://bl.ocks.org/mbostock/3048450), Heatmap, and Calendar View, and also provide the ability to dynamically filter what data gets included in the aggregation.

## Use Cases

A frequency chart (bar chart or histogram) where the user can select which column of the data to represent with bars.

 * If the column is categorical, bars should represent categories.
 * If the column is numeric, the bars should represent nice histogram bins.
 * If the column is temporal, the bars should represent nice temporal bins (years, quarters, months, weeks, days, hours, minutes, seconds).

A heat map where the user can select two columns to aggregate by, each of which may be categorical, numeric, or temporal.

## Related Work

 * [d3-arrays#nest](https://github.com/d3/d3-arrays#nest)
 * [d3 Histogram Layout](https://github.com/mbostock/d3/wiki/Histogram-Layout)
 * [Crossfilter](http://square.github.io/crossfilter/)
 * [dc.js](https://dc-js.github.io/dc.js/)
