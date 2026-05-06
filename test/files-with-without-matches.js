// Refactored from LiveScript - removed IIFE, var→const/let
const eq = require('./_helpers').eq;

suite('files with/without matches', function() {
  test('single file - files-with-matches', function(it) {
    return eq('--files-with-matches return test/data/a.js', 'test/data/a.js', it);
  });
  test('single file - files-with-matches - no results', function(it) {
    return eq('--files-with-matches "return.arg::func" test/data/a.js', [], it);
  });
  test('single file - files-without-match', function(it) {
    return eq('--files-without-match "return.arg::func" test/data/a.js', 'test/data/a.js', it);
  });
  return test('single file - files-without-match - no results', function(it) {
    return eq('--files-without-match return test/data/a.js', [], it);
  });
});
