// Refactored from LiveScript - removed IIFE, var→const/let
const eq = require('./_helpers').eq;

suite('line-number and col-number', function() {
  test('no line-number and no col-number', function(it) {
    return eq('--no-line-number return test/data/a.js', '  ##return x * x;#', it);
  });
  test('line-number and col-number', function(it) {
    return eq('--col-number return test/data/a.js', '2,2-2,14:  ##return x * x;#', it);
  });
  test('col-number without line-number', function(it) {
    return eq('--col-number --no-line-number return test/data/a.js', '2-14:  ##return x * x;#', it);
  });
  test('line-number without col-number', function(it) {
    return eq('return test/data/a.js', '2:  ##return x * x;#', it);
  });
  test('multiline no line-number and no col-number', function(it) {
    return eq('--no-line-number func-dec test/data/a.js', '(multiline):\n##function square(x) {#\n##  return x * x;#\n##}#', it);
  });
  return test('multiline col-number without line-number', function(it) {
    return eq('--col-number --no-line-number func-dec test/data/a.js', '0-0:(multiline):\n##function square(x) {#\n##  return x * x;#\n##}#', it);
  });
});
