// Refactored from LiveScript - removed IIFE, var→const/let
const eq = require('./_helpers').eq;

suite('exclude', function() {
  const baseDir = process.cwd();
  teardown(function() {
    return process.chdir(baseDir);
  });
  test('without exclude', function(it) {
    return eq('--recursive "#x" test/data', [
      'test/data/a.js:1:function square(##x#) {', 'test/data/a.js:2:  return ##x# * x;', 'test/data/a.js:2:  return x * ##x#;', {
        funcType: 'error',
        value: /Error: Could not parse JavaScript from/
      }, 'test/data/dir/c.js:2:var ##x# = z -'
    ], it);
  });
  test('exclude **/a.js', function(it) {
    return eq('--exclude "**/a.js" --recursive "#x" test/data', [
      {
        funcType: 'error',
        value: /Error: Could not parse JavaScript from/
      }, 'test/data/dir/c.js:2:var ##x# = z -'
    ], it);
  });
  test('exclude negated pattern', function(it) {
    return eq('--exclude "!**/a.js" --recursive "#x" test/data', ['test/data/a.js:1:function square(##x#) {', 'test/data/a.js:2:  return ##x# * x;', 'test/data/a.js:2:  return x * ##x#;'], it);
  });
  return test('custom minimatch props', function(it) {
    return eq('--minimatch-options={nocase:true} --exclude "!**/A.js" --recursive "#x" test/data', ['test/data/a.js:1:function square(##x#) {', 'test/data/a.js:2:  return ##x# * x;', 'test/data/a.js:2:  return x * ##x#;'], it);
  });
});
