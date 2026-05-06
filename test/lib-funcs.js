// Refactored from LiveScript - removed IIFE, var→const/let
const grasp = require('./_helpers').grasp;
const equal = require('assert').strictEqual;

suite('lib functions', function() {
  const input = 'function square(x) {\n  return x * x;\n}';
  test('version', function() {
    return equal(grasp.VERSION, require('../package.json').version);
  });
  suite('search', function() {
    test('basic', function() {
      equal(3, grasp.search('squery', '#x', input).length);
      return equal(2, grasp.search('squery', 'bi #x', input).length);
    });
    test('curried', function() {
      equal(3, grasp.search('squery', '#x')(input).length);
      return equal(3, grasp.search('squery')('#x')(input).length);
    });
    return test('equery', function() {
      return equal(3, grasp.search('equery', 'x', input).length);
    });
  });
  return suite('replace', function() {
    const replaced = 'function square(y) {\n  return y * y;\n}';
    test('basic', function() {
      return equal(grasp.replace('squery', '#x', 'y', input), replaced);
    });
    test('replace with nothing', function() {
      const replaced = 'function square(x) {\n  return ;\n}';
      equal(grasp.replace('squery', 'func', '', input), '');
      return equal(grasp.replace('squery', 'return.arg', '', input), replaced);
    });
    test('curried', function() {
      equal(grasp.replace('squery', '#x', 'y')(input), replaced);
      equal(grasp.replace('squery', '#x')('y')(input), replaced);
      return equal(grasp.replace('squery')('#x')('y')(input), replaced);
    });
    test('full squery', function() {
      return equal(grasp.replace('@gjax/grasp-squery', '#x', 'y', input), replaced);
    });
    test('equery', function() {
      return equal(grasp.replace('equery', 'x', 'y', input), replaced);
    });
    test('with replace function', function() {
      return equal(grasp.replace('squery', 'func', function(getRaw, node, query) {
        const x = getRaw(query('.params')[0]);
        return "function " + node.id.name + "AddZ(" + query('.params').map(getRaw).concat(['z']).join(', ') + ") {\n  return " + x + " * " + x + " + z;\n}";
      }, input), "function squareAddZ(x, z) {\n  return x * x + z;\n}");
    });
    return test('with replace function (equery)', function() {
      return equal(grasp.replace('equery', 'return $x * $x;', function(getRaw, node, query, named) {
        const X = getRaw(named.x).toUpperCase();
        return "return " + X + " * " + X + ";";
      }, input), "function square(x) {\n  return X * X;\n}");
    });
  });
});
