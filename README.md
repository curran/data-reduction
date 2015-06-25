# data-reduction

A utility for reducing the size of data sets for visualization.

## Use Cases

A bar chart where the user can select which column to aggregate by. If the column is categorical, bars should represent categories. If the column is numeric, the bars should represent nice histogram bins. If the column is temporal, the bars should represent nice temporal bins (e.g. hours, days, weeks, months, years).

A heat map where the user can select two columns to aggregate by, each of which may be categorical, numeric, or temporal.

## Related Work

 * [d3-arrays#nest](https://github.com/d3/d3-arrays#nest)
 * [Crossfilter](http://square.github.io/crossfilter/)
 * [dc.js](https://dc-js.github.io/dc.js/)
