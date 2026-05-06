// Refactored from LiveScript - removed IIFE, var→const/let
const eq = require('./_helpers').eq;

suite('more options', function() {
  const currentVersion = require('../package.json').version;
  test('version', function(it) {
    return eq('--version', "grasp v" + currentVersion, it);
  });
  test('version no callback', function(it) {
    return eq('--version', "grasp v" + currentVersion, it, {
      callback: false
    });
  });
  test('file (selector)', function(it) {
    return eq('--file test/data/selector test/data/a.js', ['6:  ##z++#;', '9:    b: ##2#,'], it);
  });
  test('file (selector) error', function(it) {
    return eq('--file test/data/FAKE test/data/a.js', [{
      funcType: 'error',
      value: "Error: No such file 'test/data/FAKE'."
    }], it);
  });
  test('max-count', function(it) {
    return eq('--max-count 2 "#x" test/data/a.js', ['1:function square(##x#) {', '2:  return ##x# * x;'], it);
  });
  test('debug', function(it) {
    return eq('--debug bi test/data/a.js', [
      {
        funcType: 'time',
        value: 'everything'
      }, {
        funcType: 'log',
        value: 'options:'
      }, {
        funcType: 'log',
        value: /"debug":true/
      }, {
        funcType: 'time',
        value: 'parse-selector'
      }, {
        funcType: 'time-end',
        value: 'parse-selector'
      }, {
        funcType: 'log',
        value: 'parsed-selector:'
      }, {
        funcType: 'log',
        value: /"value": "BinaryExpression"/
      }, {
        funcType: 'time',
        value: 'search-total:test/data/a.js'
      }, {
        funcType: 'time',
        value: 'parse-input:test/data/a.js'
      }, {
        funcType: 'time-end',
        value: 'parse-input:test/data/a.js'
      }, {
        funcType: 'time',
        value: 'query:test/data/a.js'
      }, {
        funcType: 'time-end',
        value: 'query:test/data/a.js'
      }, '2:  return ##x * x#;', {
        funcType: 'time-end',
        value: 'search-total:test/data/a.js'
      }, {
        funcType: 'time-end',
        value: 'everything'
      }
    ], it);
  });
  test('quiet', function(it) {
    return eq('--quiet return test/data/a.js', '2:  ##return x * x;#', it, {
      quiet: true
    });
  });
  test('equery', function(it) {
    return eq('--equery "__ * __" test/data/a.js', '2:  return ##x * x#;', it);
  });
  test('equery', function(it) {
    return eq('--equery --squery "[op=*]" test/data/a.js', '2:  return ##x * x#;', it);
  });
  test('engine', function(it) {
    return eq("--engine ../node_modules/@gjax/grasp-squery \"update[op='++']\" test/data/a.js", '6:  ##z++#;', it);
  });
  test('parser with path and options', function(it) {
    return eq('--parser "../node_modules/flow-parser, {locations: true}" prop test/data/a.js', ['8:    ##a: 1#,', '9:    ##b: 2#,', '10:    ##c: 3#'], it);
  });
  test('multiline-separator', function(it) {
    return eq('--no-multiline-separator func-dec test/data/a.js', '1-3:\n##function square(x) {#\n##  return x * x;#\n##}#', it);
  });
  return test('multiline-separator', function(it) {
    return eq('--no-multiline-separator --no-line-number func-dec test/data/a.js', '##function square(x) {#\n##  return x * x;#\n##}#', it);
  });
});
