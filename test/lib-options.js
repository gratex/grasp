// Refactored from LiveScript - removed IIFE, var→const/let
const { eq, q, StdIn, FileSystem } = require('./_helpers');
const { curry$ } = require('../lib/utils');
const assert = require('assert');
const equal = assert.strictEqual;

suite('lib options', function() {
  const data = ['function square(x) {\n', '  return x * x;\n', '}\n'];
  const results = ['1:function square(##x#) {', '2:  return ##x# * x;', '2:  return x * ##x#;'];

  suite('stdin', function() {
    test('basic', function(it) {
      return eq('#x', results, it, {
        stdin: new StdIn(data)
      });
    });
    test('using -', function(it) {
      return eq('#x -', results, it, {
        stdin: new StdIn(data)
      });
    });
    test('- and files', function(it) {
      const results = ['test/data/a.js:1:function ##square#(x) {', '(standard input):1:function ##square#(x) {'];
      return eq('#square test/data/a.js - test/data/b.js', results, it, {
        stdin: new StdIn(data)
      });
    });
    test('error in stdin input', function(it) {
      return eq('#x', [{
        funcType: 'error',
        value: /Could not parse JavaScript/
      }], it, {
        stdin: new StdIn('%$@%@%')
      });
    });
    return test('error: stdin not defined', function(it) {
      return eq('#x', [{
        funcType: 'error',
        value: /Error: stdin not defined/
      }], it);
    });
  });

  suite('exit', function() {
    const f = curry$(function(done, expected, result){
      equal(result, expected);
      return done();
    });
    test('matches', function(it) {
      return q('#x test/data/a.js', {
        exit: f(it, 0),
        error: function() {}
      });
    });
    test('no matches', function(it) {
      return q('#NONEXISTANT test/data/a.js', {
        exit: f(it, 1),
        error: function() {}
      });
    });
    return test('no exit', function() {
      return equal(void 0, q('--version', {
        error: function() {}
      }));
    });
  });

  suite('file system (fs)', function() {
    const fs = new FileSystem({
      'file.js': {
        type: 'file',
        contents: 'function square(x) {\n  return x * x;\n}'
      }
    });
    return test('basic', function(it) {
      return eq('return file.js', '2:  ##return x * x;#', it, {
        fs: fs
      });
    });
  });

  suite('text-format', function() {
    const textFormat = {
      green: function() {},
      cyan: function() {},
      magenta: function() {},
      red: function() {},
      bold: function(it) {
        return "!!" + it + "!!";
      }
    };
    return test('basic', function(it) {
      return eq('return test/data/a.js', '2:  !!return x * x;!!', it, {
        textFormat: textFormat
      });
    });
  });

  return suite('input', function() {
    const input = 'if (x) {\n  f(2 + x);\n}';
    test('basic', function(it) {
      return eq('bi', '2:  f(##2 + x#);', it, {
        input: input
      });
    });
    return test('filename', function(it) {
      return eq('bi --filename', '(input):2:  f(##2 + x#);', it, {
        input: input
      });
    });
  });
});
