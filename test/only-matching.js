// Refactored from LiveScript - removed IIFE, var→const/let
const eq = require('./_helpers').eq;

suite('only-matching', function() {
  test('basic', function(it) {
    return eq('--only-matching "#square" test/data/a.js', '1:##square#', it);
  });
  test('multiline', function(it) {
    return eq('--only-matching "func-dec block" test/data/a.js', '1-3:(multiline):\n##{#\n##  return x * x;#\n##}#', it);
  });
  return test('multiline turned into single line', function(it) {
    return eq('--only-matching -1 return test/data/a.js', '2:##return x * x;#', it);
  });
});
