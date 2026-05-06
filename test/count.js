// Refactored from LiveScript - removed IIFE, var→const/let
const eq = require('./_helpers').eq;

suite('count', function() {
  test('single file - no filename', function(it) {
    return eq('--count "#x" test/data/a.js', '3', it);
  });
  test('single file - with filename', function(it) {
    return eq('--count --filename "#x" test/data/a.js', 'test/data/a.js:3', it);
  });
  test('multiple files - no filename', function(it) {
    return eq('--count --no-filename "#/^z/" test/data/a.js test/data/b.js', ['3', '2'], it);
  });
  return test('multiple files - with filename', function(it) {
    return eq('--count "#/^z/" test/data/a.js test/data/b.js', ['test/data/a.js:3', 'test/data/b.js:2'], it);
  });
});
