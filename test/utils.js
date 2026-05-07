// Unit tests for lib/utils.js
const assert = require('assert');
const { lines, unlines, capitalize, camelize, dasherize } = require('../lib/utils');

suite('utils', function() {
  suite('lines', function() {
    test('normal string with multiple lines', function() {
      assert.deepEqual(lines('foo\nbar\nbaz'), ['foo', 'bar', 'baz']);
    });
    test('single line', function() {
      assert.deepEqual(lines('foo'), ['foo']);
    });
    test('empty string returns empty array', function() {
      assert.deepEqual(lines(''), []);
    });
    test('string with trailing newline', function() {
      assert.deepEqual(lines('foo\nbar\n'), ['foo', 'bar', '']);
    });
  });

  suite('unlines', function() {
    test('normal array with multiple lines', function() {
      assert.strictEqual(unlines(['foo', 'bar', 'baz']), 'foo\nbar\nbaz');
    });
    test('single element', function() {
      assert.strictEqual(unlines(['foo']), 'foo');
    });
    test('empty array', function() {
      assert.strictEqual(unlines([]), '');
    });
    test('array with empty strings', function() {
      assert.strictEqual(unlines(['foo', '', 'bar']), 'foo\n\nbar');
    });
  });

  suite('capitalize', function() {
    test('lowercase first char', function() {
      assert.strictEqual(capitalize('foo'), 'Foo');
    });
    test('already uppercase first char', function() {
      assert.strictEqual(capitalize('Foo'), 'Foo');
    });
    test('empty string', function() {
      assert.strictEqual(capitalize(''), '');
    });
    test('multiple words', function() {
      assert.strictEqual(capitalize('foo bar'), 'Foo bar');
    });
  });

  suite('camelize', function() {
    test('underscore separated', function() {
      assert.strictEqual(camelize('foo_bar'), 'fooBar');
    });
    test('hyphen separated', function() {
      assert.strictEqual(camelize('foo-bar'), 'fooBar');
    });
    test('mixed separator', function() {
      assert.strictEqual(camelize('foo_bar-baz'), 'fooBarBaz');
    });
    test('no separator', function() {
      assert.strictEqual(camelize('foobar'), 'foobar');
    });
    test('multiple underscores', function() {
      assert.strictEqual(camelize('foo_bar_baz'), 'fooBarBaz');
    });
    test('ending dash', function() {
      assert.strictEqual(camelize('foo-bar-'), 'fooBar');
    });
    test('more than one', function() {
      assert.strictEqual(camelize('foo--bar'), 'fooBar');
    });
  });

  suite('dasherize', function() {
    test('camelCase', function() {
      assert.strictEqual(dasherize('fooBar'), 'foo-bar');
    });
    test('PascalCase', function() {
      assert.strictEqual(dasherize('FooBar'), 'foo-bar');
    });
    test('multi-char uppercase run', function() {
      assert.strictEqual(dasherize('fooBarBaz'), 'foo-bar-baz');
    });
    test('already dasherized', function() {
      assert.strictEqual(dasherize('foo-bar'), 'foo-bar');
    });
    test('HTMLDivElement style', function() {
      assert.strictEqual(dasherize('HTMLDivElement'), 'HTMLD-iv-element');
    });
    test('already lowercase', function() {
      assert.strictEqual(dasherize('foobar'), 'foobar');
    });
    test('with numbers', function() {
      assert.strictEqual(dasherize('f1Bar'), 'f1-bar');
    });
    test('repeated capitals', function() {
      assert.strictEqual(dasherize('setJSON'), 'set-JSON');
    });
    test('starting with repeated capitals', function() {
      assert.strictEqual(dasherize('JSONget'), 'JSON-get');
    });
  });
});