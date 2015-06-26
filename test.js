var dataReduction = require("./data-reduction");
var assert = require("assert");

describe("plugins/dataReduction", function () {

  var data1 = [
    { x: 1, y: 3 },
    { x: 5, y: 9 },
    { x: 9, y: 5 },
    { x: 4, y: 0 }
  ];

  it("should compute filter (min, inclusive)", function() {
    var result = dataReduction(data1, {
      filter: [
        { column: "x", min: 5 }
      ]
    });
    assert.equal(result.length, 2);
  });

  it("should compute filter (min, multiple fields)", function() {
    var result = dataReduction(data1, {
      filter: [
        { column: "x", min: 3 },
        { column: "y", min: 2 }
      ]
    });
    assert.equal(result.length, 2);
  });

  it("should compute filter (max)", function() {
    var result = dataReduction(data1, {
      filter: [
        { column: "x", max: 3 }
      ]
    });
    assert.equal(result.length, 1);
  });

  it("should compute filter (max, inclusive)", function() {
    var result = dataReduction(data1, {
      filter: [
        { column: "x", max: 5 }
      ]
    });
    assert.equal(result.length, 3);
  });

  it("should compute filter (min & max)", function() {
    var result = dataReduction(data1, {
      filter: [
        { column: "x", min: 2, max: 6 }
      ]
    });
    assert.equal(result.length, 2);
  });

  it("should compute filter (min & max, multiple fields)", function() {
    var result = dataReduction(data1, {
      filter: [
        { column: "x", min: 1, max: 6 },
        { column: "y", min: 6, max: 9 }
      ]
    });
    assert.equal(result.length, 1);
  });

  var data2 = [
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
  ];

  it("should aggregate (count) over categories", function() {
    var result = dataReduction(data2, {
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

    assert.equal(result.length, 3);

    assert.equal(where(result, "foo", "A")[0].total, 3);
    assert.equal(where(result, "foo", "B")[0].total, 2);
    assert.equal(where(result, "foo", "C")[0].total, 5);
    assert.equal(where(result, "foo", "A")[0].total, 3);
  });

  it("should aggregate (count) over nice histogram bins", function() {
    var result = dataReduction(data2, {
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

    assert.equal(result.metadata.bar.step, 2);

    delete result.metadata;
    assert.deepEqual(result, [
      { bar: 0, total: 2 },
      { bar: 2, total: 2 },
      { bar: 4, total: 2 },
      { bar: 6, total: 3 },
      { bar: 8, total: 1 }
    ]);
  });
});

function where(data, column, value){
  return data.filter(function (d) {
    return d[column] === value;
  });
}
