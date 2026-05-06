// Refactored from LiveScript - removed IIFE, var→const/let
const ref$ = require('./_helpers');
const grasp = ref$.grasp;
const eq = ref$.eq;
const q = ref$.q;
const throws = require('assert').throws;

suite('errors and warnings', function() {
  test('call with nothing', function() {
    return throws(function() {
      return grasp();
    }, /Must specify arguments/);
  });
  test('must specify arguments', function(it) {
    return eq(null, [{
      funcType: 'error',
      value: 'Error: Must specify arguments.'
    }], it);
  });
  test('option parsing errors', function(it) {
    const msg = "Invalid value for option 'context' - expected type n::Int, received value: hi.";
    return eq('--context hi "#x" t.js', {
      funcType: 'error',
      value: msg
    }, it);
  });
  test('no such file (single target file)', function(it) {
    return eq('x test/data/FAKE.js', [{
      funcType: 'error',
      value: "Error: No such file or directory 'test/data/FAKE.js'."
    }], it);
  });
  test('no selector specified', function(it) {
    return eq('', [
      {
        funcType: 'error',
        value: /Error: No selector specified./
      }, /Usage: grasp/
    ], it);
  });
  test('no selector specified with default error func', function() {
    return throws(function() {
      return q('');
    }, /No selector specified/);
  });
  test('could not parse JS', function(it) {
    return eq('x test/data/badly-formed.js', {
      funcType: 'error',
      value: /Error: Could not parse JavaScript/
    }, it);
  });
  return test('warn - use -r', function(it) {
    return eq('"#x" test/data', {
      funcType: 'warn',
      value: "'test/data' is a directory. Use '-r, --recursive' to recursively search directories."
    }, it);
  });
});
