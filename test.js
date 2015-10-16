var dataReduction = require("./index");
var assert = require("assert");

describe("data-reduction", function () {

  var data1 = [
    { x: 1, y: 3 },
    { x: 5, y: 9 },
    { x: 9, y: 5 },
    { x: 4, y: 0 }
  ];

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

  it("should compute filter >=", function() {
    var result = dataReduction(data1, {
      filters: [
        { column: "x", predicate: ">=", value: 5 }
      ]
    });
    assert.equal(result.data.length, 2);
    assert(result.data[0].x >= 5);
    assert(result.data[1].x >= 5);
  });

  it("should compute filter >", function() {
    var result = dataReduction(data1, {
      filters: [
        { column: "x", predicate: ">", value: 5 }
      ]
    });
    assert.equal(result.data.length, 1);
  });

  it("should compute filter <", function() {
    var result = dataReduction(data1, {
      filters: [
        { column: "x", predicate: "<", value: 5 }
      ]
    });
    assert.equal(result.data.length, 2);
    assert(result.data[0].x < 5);
    assert(result.data[1].x < 5);
  });

  it("should compute filter >= with multiple fields", function() {
    var result = dataReduction(data1, {
      filters: [
        { column: "x", predicate: ">=", value: 3 },
        { column: "y", predicate: ">=", value: 2 }
      ]
    });
    assert.equal(result.data.length, 2);
  });

  it("should compute filter <=", function() {
    var result = dataReduction(data1, {
      filters: [
        { column: "x", predicate: "<=", value: 3 }
      ]
    });
    assert.equal(result.data.length, 1);
  });

  it("should compute filter <=", function() {
    var result = dataReduction(data1, {
      filters: [
        { column: "x", predicate: "<=", value: 5 }
      ]
    });
    assert.equal(result.data.length, 3);
  });

  it("should compute filter >= and <=, same field", function() {
    var result = dataReduction(data1, {
      filters: [
        { column: "x", predicate: ">=", value: 2 },
        { column: "x", predicate: "<=", value: 6 }
      ]
    });
    assert.equal(result.data.length, 2);
  });

  it("should compute filter >= and <=, multiple fields", function() {
    var result = dataReduction(data1, {
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
    var result = dataReduction(data2, {
      filters: [
        { column: "bar", predicate: "==", value: 6 }
      ]
    });
    assert.equal(result.data.length, 3);
    assert("foo" in result.data[0]);
    assert("bar" in result.data[0]);
  });

  it("should compute filter !=", function() {
    var result = dataReduction(data2, {
      filters: [
        { column: "bar", predicate: "!=", value: 6 }
      ]
    });
    assert.equal(result.data.length, 7);
  });

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

    assert.equal(result.data.length, 3);

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

    assert.deepEqual(result.data, [
      { bar: 0, total: 2 },
      { bar: 2, total: 2 },
      { bar: 4, total: 2 },
      { bar: 6, total: 4 }
    ]);
  });

  it("should aggregate (count) over distinct numeric values", function() {
    var result = dataReduction(data2, {
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
});

function where(result, column, value){
  return result.data.filter(function (d) {
    return d[column] === value;
  });
}
