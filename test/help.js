// Refactored from LiveScript - removed IIFE, var→const/let
const eq = require('./_helpers').eq;

suite('help', function() {
  test('no positional', function(it) {
    return eq('--help', /^Usage: grasp/, it);
  });
  test('no positional no callback', function(it) {
    return eq('--help', /^Usage: grasp/, it, {
      callback: false
    });
  });
  test('more', function(it) {
    return eq('--help more', /-h, --help\n==========\ndescription:/, it);
  });
  test('advanced', function(it) {
    return eq('--help advanced', /-p, --parser/, it);
  });
  test('option-name', function(it) {
    return eq('--help --context', /-C, --context n::Int\n====================\ndescription:/, it);
  });
  test('short option-name', function(it) {
    return eq('--help -CA', /-C, --context n::Int[\s\S]+-A, --after-context/, it);
  });
  test('multiple options', function(it) {
    return eq('--help --context --after-context', /-C, --context n::Int[\s\S]+-A, --after-context/, it);
  });
  test('non existant option', function(it) {
    return eq('--help --FAKE', "Invalid option '--FAKE' - perhaps you meant '-F'?", it);
  });
  test('verbose options', function(it) {
    return eq('--help verbose', /# Context control #[\s\S]+-A, --after-context n::Int[\s\S]+description: Print n/, it);
  });
  test('syntax', function(it) {
    return eq('--help syntax', /JavaScript abstract syntax help:[\s\S]+if \(IfStatement\)/, it);
  });
  test('node, syntax and multiple examples', function(it) {
    return eq('--help if', /if \(IfStatement\)[\s\S]+node fields: test, consequent \(alias: then\)[\s\S]+syntax:[\s\S]+examples:/, it);
  });
  test('node with one example', function(it) {
    return eq('--help debugger', /debugger \(DebuggerStatement\)[\s\S]+example:/, it);
  });
  test('node without syntax or example', function(it) {
    return eq('--help program', /program \(Program\)[\s\S]+node array fields: body/, it);
  });
  test('node full name ', function(it) {
    return eq('--help DebuggerStatement', /debugger \(DebuggerStatement\)[\s\S]+example:/, it);
  });
  test('multiple nodes', function(it) {
    return eq('--help debugger empty', /debugger \(DebuggerStatement\)[\s\S]+example:[\s\S]+empty \(EmptyStatement\)/, it);
  });
  test('categories', function(it) {
    return eq('--help categories', /Categories of node types:[\s\S]+func \(Function\): func-dec, func-exp\n/, it);
  });
  test('category', function(it) {
    return eq('--help func', /A node type category\.\n\nfunc \(Function\)[\s\S]+func-exp \(FunctionExpression\)/, it);
  });
  test('category full name', function(it) {
    return eq('--help Function', /A node type category\.\n\nfunc \(Function\)[\s\S]+func-exp \(FunctionExpression\)/, it);
  });
  return test('no such help option', function(it) {
    return eq('--help FAKE', 'No such help option: FAKE.', it);
  });
});
