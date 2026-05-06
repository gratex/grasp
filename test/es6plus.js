// Refactored from LiveScript - removed IIFE, var→const/let
const eq = require('./_helpers').eq;

suite('es6plus', function() {
  return test('single line', function(it) {
    return eq('"func.body #a" test/data/es6plus.js', '24:    this.n += ##a#;', it);
  });
});
