var dataReduction = require("./index");
var assert = require("assert");
var time = require("d3-time");
var ChiasmDataset = require("chiasm-dataset");

describe("data-reduction", function () {

  var dataset1 = {
    data: [
      { x: 1, y: 3 },
      { x: 5, y: 9 },
      { x: 9, y: 5 },
      { x: 4, y: 0 }
    ],
    metadata: {
      columns: [
        { name: "x", type: "number" },
        { name: "y", type: "number" }
      ]
    }
  };

  var dataset2 = {
    data: [
      { foo: "A", bar: 1 },
      { foo: "A", bar: 8 },
      { foo: "A", bar: 6 }, // A sum = 15, count = 3
      { foo: "B", bar: 4 },
      { foo: "B", bar: 3 }, // B sum = 7, count = 2
      { foo: "C", bar: 6 },
      { foo: "C", bar: 1 },
      { foo: "C", bar: 3 },
      { foo: "C", bar: 6 },
      { foo: "C", bar: 4 } // C sum = 20, count = 5
    ],
    metadata: {
      columns: [
        { name: "foo", type: "string" },
        { name: "bar", type: "number" }
      ]
    }
  };

  var dataset3 = {
    data: [

      // 3 entries in the same hour.
      { timestamp: new Date("2015-10-17T17:17:23") },
      { timestamp: new Date("2015-10-17T17:18:23") },
      { timestamp: new Date("2015-10-17T17:19:23") },

      // 4 entries in the same day.
      { timestamp: new Date("2015-10-18T17:19:23") },
      { timestamp: new Date("2015-10-18T18:19:23") },
      { timestamp: new Date("2015-10-18T19:19:23") },
      { timestamp: new Date("2015-10-18T20:19:23") }
    ],
    metadata: {
      columns: [
        { name: "timestamp", type: "date" }
      ]
    }
  };

  it("validate input datasets", function(done) {
    Promise.all([
      ChiasmDataset.validate(dataset1),
      ChiasmDataset.validate(dataset2),
      ChiasmDataset.validate(dataset3)
    ]).then(function (results){
      done();
    });
  });

  it("should compute filter >=", function(done) {
    var result = dataReduction(dataset1, {
      filters: [
        { column: "x", predicate: ">=", value: 5 }
      ]
    });
    assert.equal(result.data.length, 2);
    assert(result.data[0].x >= 5);
    assert(result.data[1].x >= 5);

    ChiasmDataset.validate(result).then(done, console.log);
  });

  it("should compute filter >", function() {
    var result = dataReduction(dataset1, {
      filters: [
        { column: "x", predicate: ">", value: 5 }
      ]
    });
    assert.equal(result.data.length, 1);
  });

  it("should compute filter <", function() {
    var result = dataReduction(dataset1, {
      filters: [
        { column: "x", predicate: "<", value: 5 }
      ]
    });
    assert.equal(result.data.length, 2);
    assert(result.data[0].x < 5);
    assert(result.data[1].x < 5);
  });

  it("should compute filter >= with multiple fields", function() {
    var result = dataReduction(dataset1, {
      filters: [
        { column: "x", predicate: ">=", value: 3 },
        { column: "y", predicate: ">=", value: 2 }
      ]
    });
    assert.equal(result.data.length, 2);
  });

  it("should compute filter <=", function() {
    var result = dataReduction(dataset1, {
      filters: [
        { column: "x", predicate: "<=", value: 3 }
      ]
    });
    assert.equal(result.data.length, 1);
  });

  it("should compute filter <=", function() {
    var result = dataReduction(dataset1, {
      filters: [
        { column: "x", predicate: "<=", value: 5 }
      ]
    });
    assert.equal(result.data.length, 3);
  });

  it("should compute filter >= and <=, same field", function() {
    var result = dataReduction(dataset1, {
      filters: [
        { column: "x", predicate: ">=", value: 2 },
        { column: "x", predicate: "<=", value: 6 }
      ]
    });
    assert.equal(result.data.length, 2);
  });

  it("should compute filter >= and <=, multiple fields", function() {
    var result = dataReduction(dataset1, {
      filters: [
        { column: "x", predicate: ">=", value: 1 },
        { column: "x", predicate: "<=", value: 6 },
        { column: "y", predicate: ">=", value: 6 },
        { column: "y", predicate: "<=", value: 9 }
      ]
    });
    assert.equal(result.data.length, 1);
  });

  it("should compute filter ==", function() {
    var result = dataReduction(dataset2, {
      filters: [
        { column: "bar", predicate: "==", value: 6 }
      ]
    });
    assert.equal(result.data.length, 3);
    assert("foo" in result.data[0]);
    assert("bar" in result.data[0]);
  });

  it("should compute filter !=", function() {
    var result = dataReduction(dataset2, {
      filters: [
        { column: "bar", predicate: "!=", value: 6 }
      ]
    });
    assert.equal(result.data.length, 7);
  });

  it("should aggregate (count) over categories", function() {
    var result = dataReduction(dataset2, {
      aggregate: {
        dimensions: [{
          column: "foo"
        }],
        measures: [{
          outColumn: "total", 
          operator: "count"
        }]
      }
    });

    assert.equal(result.data.length, 3);

    assert.equal(where(result, "foo", "A")[0].total, 3);
    assert.equal(where(result, "foo", "B")[0].total, 2);
    assert.equal(where(result, "foo", "C")[0].total, 5);
    assert.equal(where(result, "foo", "A")[0].total, 3);
  });

  it("should aggregate (count) over nice histogram bins", function() {
    var result = dataReduction(dataset2, {
      aggregate: {
        dimensions: [{
          column: "bar",
          histogram: true,
          numBins: 3
        }],
        measures: [{
          outColumn: "total", 
          operator: "count"
        }]
      }
    });

    assert.equal(result.metadata.bar.interval, 2);
    assert.equal(result.metadata.bar.domain[0], 0);
    assert.equal(result.metadata.bar.domain[1], 8);

    assert.deepEqual(result.data, [
      { bar: 0, total: 2 },
      { bar: 2, total: 2 },
      { bar: 4, total: 2 },
      { bar: 6, total: 4 }
    ]);
  });

  it("should aggregate (count) over distinct numeric values", function() {
    var result = dataReduction(dataset2, {
      aggregate: {
        dimensions: [{
          column: "bar"
        }],
        measures: [{
          outColumn: "total", 
          operator: "count"
        }]
      }
    });

    assert.equal(result.data.length, 5);

    assert.equal(where(result, "bar", 1)[0].total, 2);
    assert.equal(where(result, "bar", 3)[0].total, 2);
    assert.equal(where(result, "bar", 4)[0].total, 2);
    assert.equal(where(result, "bar", 6)[0].total, 3);
    assert.equal(where(result, "bar", 8)[0].total, 1);
  });

  it("should aggregate (count) over dates (days)", function() {
    var result = dataReduction(dataset3, {
      aggregate: {
        dimensions: [{
          column: "timestamp",
          timeInterval: "day"
        }],
        measures: [{
          outColumn: "total", 
          operator: "count"
        }]
      }
    });

    //console.log(JSON.stringify(result));
    //assert.equal(result.metadata.timestamp.step, time.day);
    //assert.equal(result.metadata.timestamp.interval, "day");
  });
});

function where(result, column, value){
  return result.data.filter(function (d) {
    return d[column] === value;
  });
}
