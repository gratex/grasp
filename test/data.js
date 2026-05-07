// Refactored from LiveScript - removed IIFE, var→const/let
const eq = require('./_helpers').eq;
const assert = require('assert');
const equal = assert.strictEqual;
const deepEqual = assert.deepEqual;
const { toString$ } = require('../lib/utils');

suite('data', function() {
  suite('basic', function() {
    test('single file', function(it) {
      return eq('return test/data/a.js', /ReturnStatement/, it, {
        data: true,
        final: function(result) {
          equal(toString$.call(result).slice(8, -1), 'Array');
          return equal(result[0].type, 'ReturnStatement');
        }
      });
    });
    test('multiple files', function(it) {
      return eq('return test/data/a.js test/data/b.js', [/a\.js/, /b\.js/], it, {
        data: true,
        final: function(result) {
          equal(toString$.call(result).slice(8, -1), 'Object');
          return equal(result['test/data/a.js'][0].type, 'ReturnStatement');
        }
      });
    });
    return test('multiple files, no filename', function(it) {
      return eq('--no-filename return test/data/a.js test/data/b.js', [/ReturnStatement/, /ReturnStatement/], it, {
        data: true,
        final: function(result) {
          equal(toString$.call(result).slice(8, -1), 'Array');
          equal(toString$.call(result[0]).slice(8, -1), 'Array');
          return equal(result[0][0].type, 'ReturnStatement');
        }
      });
    });
  });
  suite('files with/without matches', function() {
    test('single file - files-with-matches', function(it) {
      return eq('--files-with-matches return test/data/a.js', /test\/data\/a\.js/, it, {
        data: true,
        final: function(result) {
          return deepEqual(result, ["test/data/a.js"]);
        }
      });
    });
    test('single file - files-with-matches - no results', function(it) {
      return eq('--files-with-matches "return.arg::func" test/data/a.js', [], it, {
        data: true,
        final: function(result) {
          return deepEqual(result, []);
        }
      });
    });
    test('single file - files-without-match', function(it) {
      return eq('--files-without-match "return.arg::func" test/data/a.js', /test\/data\/a\.js/, it, {
        data: true,
        final: function(result) {
          return deepEqual(result, ["test/data/a.js"]);
        }
      });
    });
    return test('single file - files-without-match - no results', function(it) {
      return eq('--files-without-match return test/data/a.js', [], it, {
        data: true,
        final: function(result) {
          return deepEqual(result, []);
        }
      });
    });
  });
  return suite('count', function() {
    test('single file - no filename', function(it) {
      return eq('--count "#x" test/data/a.js', /3/, it, {
        data: true,
        final: function(result) {
          return deepEqual(result, [3]);
        }
      });
    });
    test('single file - with filename', function(it) {
      return eq('--count --filename "#x" test/data/a.js', /test\/data\/a\.js/, it, {
        data: true,
        final: function(result) {
          return deepEqual(result, {
            "test/data/a.js": 3
          });
        }
      });
    });
    test('multiple files - no filename', function(it) {
      return eq('--count --no-filename "#/^z/" test/data/a.js test/data/b.js', [/3/, /2/], it, {
        data: true,
        final: function(result) {
          return deepEqual(result, [3, 2]);
        }
      });
    });
    return test('multiple files - with filename', function(it) {
      return eq('--count "#/^z/" test/data/a.js test/data/b.js', [/a\.js/, /b\.js/], it, {
        data: true,
        final: function(result) {
          return deepEqual(result, {
            "test/data/a.js": 3,
            "test/data/b.js": 2
          });
        }
      });
    });
  });
});
