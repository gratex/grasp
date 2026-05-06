// Refactored from LiveScript - removed IIFE, var→const/let
const eq = require('./_helpers').eq;

suite('context', function() {
  test('context', function(it) {
    return eq('--context 1 return test/data/a.js', '2:(multiline):\nfunction square(x) {\n  ##return x * x;#\n}', it);
  });
  test('before context', function(it) {
    return eq('--before-context 1 return test/data/a.js', '2:(multiline):\nfunction square(x) {\n  ##return x * x;#', it);
  });
  test('after context', function(it) {
    return eq('--after-context 1 return test/data/a.js', '2:(multiline):\n  ##return x * x;#\n}', it);
  });
  return test('context shorthand', function(it) {
    return eq('-1 return test/data/a.js', '2:(multiline):\nfunction square(x) {\n  ##return x * x;#\n}', it);
  });
});
