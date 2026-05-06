// Refactored from LiveScript - removed IIFE, var→const/let
const eq = require('./_helpers').eq;

suite('json', function() {
  suite('basic', function() {
    test('single file', function(it) {
      return eq('--json return test/data/a.js', /^\[{"type":"ReturnStatement"/, it);
    });
    test('single file without callback', function(it) {
      return eq('--json return test/data/a.js', /^\[{"type":"ReturnStatement"/, it, {
        callback: false
      });
    });
    test('multiple files', function(it) {
      return eq('--json return test/data/a.js test/data/b.js', /^{"test\/data\/a.js":\[/, it);
    });
    return test('multiple files no filename', function(it) {
      return eq('--no-filename --json return test/data/a.js test/data/b.js', /^\[\[/, it);
    });
  });
  suite('files with/without match', function() {
    test('single file - files-with-matches', function(it) {
      return eq('--files-with-matches --json return test/data/a.js', '["test/data/a.js"]', it);
    });
    test('single file - files-with-matches - no results', function(it) {
      return eq('--files-with-matches --json "return.arg::func" test/data/a.js', '[]', it);
    });
    test('single file - files-without-match', function(it) {
      return eq('--files-without-match --json "return.arg::func" test/data/a.js', '["test/data/a.js"]', it);
    });
    return test('single file - files-without-match - no results', function(it) {
      return eq('--files-without-match --json return test/data/a.js', '[]', it);
    });
  });
  return suite('count', function() {
    test('single file - no filename', function(it) {
      return eq('--count --json "#x" test/data/a.js', '[3]', it);
    });
    test('single file - with filename', function(it) {
      return eq('--count --json --filename "#x" test/data/a.js', '{"test/data/a.js":3}', it);
    });
    test('multiple files - no filename', function(it) {
      return eq('--count --json --no-filename "#/^z/" test/data/a.js test/data/b.js', '[3,2]', it);
    });
    return test('multiple files - with filename', function(it) {
      return eq('--count --json "#/^z/" test/data/a.js test/data/b.js', '{"test/data/a.js":3,"test/data/b.js":2}', it);
    });
  });
});
