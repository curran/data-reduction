var d3 = {
  scale: require("d3-scale"),
  time: require("d3-time"),
  extent: require("d3-arrays").extent
};

// These are the comparison types available to use as
// the "predicate" property of filters.
var comparators = {
  ">=": function (a, b){ return a >= b; },
  ">":  function (a, b){ return a > b;  },
  "<=": function (a, b){ return a <= b; },
  "<":  function (a, b){ return a < b;  },
  "==": function (a, b){ return a == b; },
  "!=": function (a, b){ return a != b; }
};

function filter(data, filters){
  filters.forEach(function (filter){
    var column = filter.column;
    var value = filter.value;
    var comparator = comparators[filter.predicate];
    data = data.filter(function (d){
      return comparator(d[column], value);
    });
  });
  return data;
}

function aggregate(data, options){

  var dataByKey = {};

  function getRow(d, dimensions){
    var key = makeKey(d, dimensions);
    if(key in dataByKey){
      return dataByKey[key];
    } else {
      var row = makeRow(d, dimensions);
      dataByKey[key] = row;
      return row;
    }
  }

  data.forEach(function (d){
    var row = getRow(d, options.dimensions);
    options.measures.forEach(function (measure){
      var outColumn = measure.outColumn;
      if(measure.operator === "count"){
        row[outColumn] = (row[outColumn] || 0) + 1;
      }
    });
  });

  return Object.keys(dataByKey).map(function (key){
    return dataByKey[key];
  });
}

function makeKey(d, dimensions){
  return dimensions.map(function (dimension){
    return dimension.accessor(d);
  }).join(";");
}

function makeRow(d, dimensions){
  var row = {};
  dimensions.forEach(function (dimension){
    row[dimension.column] = dimension.accessor(d);
  });
  return row;
}

// Implements a filter -> aggregate data flow.
function dataReduction(data, options){

  var metadata = {};

  if("filters" in options){
    data = filter(data, options.filters);
  }

  if("aggregate" in options){
    options.aggregate.dimensions.forEach(function (dimension){

      if(dimension.histogram){

        // Compute a binning scheme based on the data and dimension.
        var binning = generateNumericBinning(data, dimension.column, dimension.numBins);

        // This accessor returns the bin for a given row of data.
        dimension.accessor = binning.accessor;

        // This metadata contains the span and computed (min, max) for histograms.
        metadata[dimension.column] = binning.metadata;
      } else if(dimension.timeInterval){

        var binning = generateTemporalBinning(data, dimension.column, dimension.timeInterval);

        // This accessor returns the bin for a given row of data,
        // returning the floor of its time interval as a JS Date object.
        dimension.accessor = binning.accessor;

        // This metadata contains the interval and computed (min, max).
        metadata[dimension.column] = binning.metadata;
      } else {
        dimension.accessor = accessor(dimension.column);
      }
    });
    data = aggregate(data, options.aggregate);
  }

  // TODO document this data structure explicitly and reference it
  // in the README of dsv-dataset and data-reduction.
  return {
    data: data,

    // TODO make this the same metadata data structure as used by dsv-dataset.
    metadata: metadata
  };
};

function accessor(column){
  return function (d){
    return d[column];
  };
}

function generateNumericBinning(data, column, numBins){

  var rawAccessor = accessor(column);
  var count = numBins + 1;

  var ticks = d3.scale.linear()
    .domain(d3.extent(data, rawAccessor))
    .nice(count)
    .ticks(count);

  var n = ticks.length - 1;
  var min = ticks[0];
  var max = ticks[n];
  var span = max - min;
  var step = span / n;

  // Accesses the value for the row "d" and assigns it to a
  // histogram bin corresponding to nicely spaced tick mark intervals.
  var binAccessor = function(d){

    // Access the original data value.
    var value = rawAccessor(d);

    // Normalize the value to fall between 0 and 1.
    var normalized = (value - min) / span;

    // Assign the value to one of the n histogram bins.
    var i = Math.floor(normalized * n);

    // Handle the special case of the max value,
    // making the last bin inclusive of the max.
    if( i === n ){
      i--;
    }

    // Return the value in data space that corresponds to the selected bin.
    return ticks[i];
  };

  return {
    accessor: binAccessor,
    metadata: {

      // The step metadata is exported for a Histogram or HeatMap implementation to use.
      // see https://gist.github.com/mbostock/3202354#file-index-html-L42
      step: step,

      // The min and max depend on the nice tick interval computation,
      // and are not the same as min/max of the original data.
      domain: [min, max]
    }
  };
}
function generateTemporalBinning(data, column, timeInterval){

  var rawAccessor = accessor(column);
  var interval = d3.time[timeInterval];
  var binAccessor = function(d){
    return interval(rawAccessor(d));
  };

  return {
    accessor: binAccessor,
    metadata: {
      step: interval,
      domain: d3.extent(data, binAccessor)
    }
  };
}

module.exports = dataReduction;
