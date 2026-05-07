// Refactored from LiveScript - removed IIFE, var→const/let
const eq = require('./_helpers').eq;

suite('filename', function() {
  test('single file - with filename', function(it) {
    return eq('--filename return test/data/a.js', 'test/data/a.js:2:  ##return x * x;#', it);
  });
  test('single file - without filename', function(it) {
    return eq('return test/data/a.js', '2:  ##return x * x;#', it);
  });
  test('multiple files - with filename', function(it) {
    return eq('return test/data/a.js test/data/b.js', ['test/data/a.js:2:  ##return x * x;#', 'test/data/b.js:4:    ##return zz + zz;#'], it);
  });
  test('multiple files - without filename', function(it) {
    return eq('--no-filename return test/data/a.js test/data/b.js', ['2:  ##return x * x;#', '4:    ##return zz + zz;#'], it);
  });
  return test('absolute file paths', function(it) {
    return eq("--filename return " + process.cwd() + "/test/data/a.js", "test/data/a.js:2:  ##return x * x;#", it);
  });
});
