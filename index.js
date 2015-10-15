var d3 = require("d3");

var comparators = {
  ">=": function (a, b){ return a >= b; }
  // >
  // ==
  // !=
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

      dimension.accessor = accessor(dimension.column);

      if(dimension.histogram){

        var count = dimension.numBins + 1;

        var ticks = d3.scale.linear()
          .domain(d3.extent(data, dimension.accessor))
          .nice(count)
          .ticks(count);

        var n = ticks.length - 1;
        var min = ticks[0];
        var max = ticks[n];
        var span = max - min;
        var step = span / n;

        var rawAccessor = dimension.accessor;

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

        dimension.accessor = binAccessor;

        metadata[dimension.column] = {

          // The step metadata is exported for a Histogram or HeatMap implementation to use.
          // see https://gist.github.com/mbostock/3202354#file-index-html-L42
          step: step,

          // The min and max depend on the nice tick interval computation,
          // and are not the same as min/max of the original data.
          domain: [min, max]
        };

      }
    });
    data = aggregate(data, options.aggregate);
  }

  return {
    data: data,
    metadata: metadata
  };
};

function accessor(column){
  return function (d){
    return d[column];
  };
}

module.exports = dataReduction;
