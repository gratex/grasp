// Refactored from LiveScript - removed IIFE, var→const/let
const eq = require('./_helpers').eq;
const clc = require('cli-color');

suite('color', function() {
  return test('basic single line', function(it) {
    return eq('return test/data/a.js', clc.green(2) + "" + clc.cyan(':') + "  " + clc.red(clc.bold('return x * x;')), it, {
      color: true
    });
  });
});
