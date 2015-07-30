# data-reduction

A utility for reducing the size of data sets for visualization. This library provides data reduction functionality using filtering and binned aggregation.

One of the most common challenges in data visualization is handling a large amount of data. There have been many discussions on the [D3 mailing list](https://groups.google.com/forum/#!forum/d3-js) about this topic: ["Building d3 charts with millions of data"](https://groups.google.com/forum/#!topic/d3-js/4XVPP5zaR5E), ["200MB data to browser with D3?"](https://groups.google.com/forum/#!topic/d3-js/UsqwkrXbSrg), ["Creating chart using d3 with more than thousand records"](), ["data visualization of 100 millions of record"](https://groups.google.com/forum/#!searchin/d3-js/imMens/d3-js/ix58Fu_5eLY/E3ClEWnIneYJ) and ["D3JS to visualize BIG DATA"](https://groups.google.com/forum/#!searchin/d3-js/imMens/d3-js/aRKFtUaE5h4/mDGgiBUMtokJ).

There are two main approaches to solve the problem of "Big Data Visualization":

 * push the limits of graphics technology to directly visualize millions of records, or
 * use some kind of data reduction approach to summarize the data.

Pushing the limits of technology using techniques like [progressive rendering](http://bl.ocks.org/syntagmatic/raw/3341641/) or [WebGL](http://engineering.ayasdi.com/2015/01/09/converting-a-d3-visualization-to-webgl-how-and-why/) is advocated and practiced by many people, however for information visualization, I would argue that this approach is not ideal. Think about it like this: if there are more data points than pixels, can you really perceive all of the data by plotting one mark per data points? If you cannot perceive all of the marks, are they worth rendering?

The second approach is to use data reduction techniques to reduce the data before rendering it. The idea behind this is to preserve all of the interesting structures in the data that you would perceive if you did plot all of the records (such as density distribution), while reducing the number of marks that need to be rendered. The paper [imMens: Real-time Visual Querying of Big Data] contains a great overview of data reduction methods (Section 3), which includes

 * filtering - show data that fall within certain data intervals (e.g. filter by a limited time range)
 * sampling - show a random subset of the data
 * binned aggregation - compute aggregated values over bins of the data space (e.g. count per day)
 * model-based abstraction - show summaries of the data computed by statistical (or other) models (e. g. show the mean and variance of a normal distribution rather than all the points).

This library exposes JavaScript implementations for **filtering** and **binned aggregation**.

## Use Cases

The main goal of the this package is to unifying the aggregation computation behind visualizations including:

 * [Histogram](http://bl.ocks.org/mbostock/3048450)
 * [Bar Chart](http://bl.ocks.org/mbostock/3885304)
 * [Heatmap](http://bl.ocks.org/mbostock/3202354)
 * [Day / Hour Heatmap](http://bl.ocks.org/tjdecke/5558084)
 * [Calendar View](http://bl.ocks.org/mbostock/4063318)
 * [Stream Graph](http://bl.ocks.org/mbostock/582915)
 
Also, this package provides the ability to dynamically filter the data before aggregation, which is a common need for linked interactive visualizations.

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
