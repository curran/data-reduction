import { linear } from "d3-scale";
import accessor from "column-accessor";
import { extent } from "d3-arrays";

function filter(data, predicates){
  predicates.forEach(function (predicate){
    if("min" in predicate){
      data = data.filter(function (d){
        return d[predicate.column] >= predicate.min;
      });
    }
    if("max" in predicate){
      data = data.filter(function (d){
        return d[predicate.column] <= predicate.max;
      });
    }
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
  if("filter" in options){
    data = filter(data, options.filter);
  }

  if("aggregate" in options){
    options.aggregate.dimensions.forEach(function (dimension){
      dimension.accessor = accessor(dimension.column);

      if(dimension.histogram){

        var count = dimension.numBins + 1;
        var ticks = linear()
          .domain(extent(data, dimension.accessor))
          .nice(count)
          .ticks(count);
        var n = ticks.length - 1;
        var min = ticks[0];
        var max = ticks[n];
        var span = max - min;
        var step = span / n;

        var rawAccessor = dimension.accessor;
        var binAccessor = function(d){
          var value = rawAccessor(d);
          var normalized = (value - min) / span; // Varies between 0 and 1
          var i = Math.floor(normalized * n);
          return ticks[i];
        };
        dimension.accessor = binAccessor;
      }
    });
    data = aggregate(data, options.aggregate);
  }
  return data;
};

export default dataReduction;
