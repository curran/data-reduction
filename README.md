# data-reduction

A utility for reducing the size of data sets for visualization.

The main goal of the this package is to unifying the aggregation computation behind visualizations including:

 * [Histogram](http://bl.ocks.org/mbostock/3048450)
 * [Bar Chart](http://bl.ocks.org/mbostock/3885304)
 * [Heatmap](http://bl.ocks.org/mbostock/3202354)
 * [Day / Hour Heatmap](http://bl.ocks.org/tjdecke/5558084)
 * [Calendar View](http://bl.ocks.org/mbostock/4063318)
 * [Stream Graph](http://bl.ocks.org/mbostock/582915)
 
Also, this package provides the ability to dynamically filter the data before aggregation, which is a common need for linked interactive visualizations.

## Use Cases

A frequency chart (bar chart or histogram) where the user can select which column of the data to represent with bars.

 * If the column is categorical, bars should represent categories.
 * If the column is numeric, the bars should represent nice histogram bins.
 * If the column is temporal, the bars should represent nice temporal bins:
   * years, quarters, months, weeks, days, hours, minutes, seconds

A heat map where the user can select two columns to aggregate by, each of which may be categorical, numeric, or temporal.

A calendar view where the user can select which column to sum to compute the value for each day.

Linked views where clicking on a bar in a bar chart will filter the data used as input to another bar chart.

[Linked Choropleth Map and Line Chart](http://curran.github.io/model/examples/d3LinkedChoropleth/)

## Related Work

 * [Crossfilter](http://square.github.io/crossfilter/)
 * [d3 Histogram](http://bl.ocks.org/mbostock/3048450)
 * [d3 Histogram Layout](https://github.com/mbostock/d3/blob/master/src/layout/histogram.js)
 * [Heatmap (2D Histogram, CSV)](http://bl.ocks.org/mbostock/3202354)
 * [d3-arrays#nest](https://github.com/d3/d3-arrays#nest)
 * [dc.js](https://dc-js.github.io/dc.js/)
