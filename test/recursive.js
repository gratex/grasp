// Refactored from LiveScript - removed IIFE, var→const/let
const eq = require('./_helpers').eq;

suite('recursive', function() {
  const baseDir = process.cwd();
  teardown(function() {
    return process.chdir(baseDir);
  });
  test('basic', function(it) {
    return eq('--recursive "#x" test/data', [
      'test/data/a.js:1:function square(##x#) {', 'test/data/a.js:2:  return ##x# * x;', 'test/data/a.js:2:  return x * ##x#;', {
        funcType: 'error',
        value: /Error: Could not parse JavaScript from/
      }, 'test/data/dir/c.js:2:var ##x# = z -'
    ], it);
  });
  const results = [
    'a.js:1:function square(##x#) {', 'a.js:2:  return ##x# * x;', 'a.js:2:  return x * ##x#;', {
      funcType: 'error',
      value: /Error: Could not parse JavaScript from/
    }, 'dir/c.js:2:var ##x# = z -'
  ];
  test('on .', function(it) {
    return eq('--recursive "#x" .', results, it, {
      dir: 'test/data/'
    });
  });
  test('no target specified, default to .', function(it) {
    return eq('--recursive "#x"', results, it, {
      dir: 'test/data/'
    });
  });
  const results2 = [
    {
      funcType: 'error',
      value: /Error: Could not parse JavaScript from/
    }, {
      funcType: 'error',
      value: /Error: Could not parse JavaScript from/
    }, 'test/data/replacement:1:console.##log#(\'debug\');'
  ];
  return test('no extension', function(it) {
    return eq('--extensions "." --recursive "#log" test/data', results2, it);
  });
});
