// Refactored from LiveScript - removed IIFE, var→const/let
const eq = require('./_helpers').eq;

suite('basic', function() {
  test('single line', function(it) {
    return eq('"#square" test/data/a.js', '1:function ##square#(x) {', it);
  });
  test('no callback', function(it) {
    return eq('"#square" test/data/a.js', '1:function ##square#(x) {', it, {
      callback: false
    });
  });
  test('single line - 2', function(it) {
    return eq('"#x" test/data/a.js', ['1:function square(##x#) {', '2:  return ##x# * x;', '2:  return x * ##x#;'], it);
  });
  test('single line - 3', function(it) {
    return eq('return test/data/a.js', '2:  ##return x * x;#', it);
  });
  test('multiline func', function(it) {
    return eq('func-dec test/data/a.js', '1-3:(multiline):\n##function square(x) {#\n##  return x * x;#\n##}#', it);
  });
  test('multiline obj', function(it) {
    return eq('obj test/data/a.js', '7-11:(multiline):\n  var obj = ##{#\n##    a: 1,#\n##    b: 2,#\n##    c: 3#\n##  }#;', it);
  });
  return test('multiple files', function(it) {
    return eq('return test/data/a.js test/data/b.js', ['test/data/a.js:2:  ##return x * x;#', 'test/data/b.js:4:    ##return zz + zz;#'], it);
  });
});
