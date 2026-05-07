// Utility functions replacing prelude-ls — exact behavioral equivalents
// Sourced from prelude-ls lib/Str.js

// lines: split on newlines; empty string returns [] (matches prelude-ls behavior exactly)
const lines = str => str.length === 0 ? [] : str.split('\n');

// unlines: join with newlines
const unlines = arr => arr.join('\n');

// capitalize: uppercase first character only
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

// camelize: foo_bar / foo-bar → fooBar
const camelize = str => str.replace(/[-_]+(.)?/g, (_, c) => (c != null ? c : '').toUpperCase());

// dasherize: fooBar → foo-bar (handles multi-char uppercase runs)
// Copied exactly from prelude-ls lib/Str.js
const dasherize = str =>
  str.replace(/([^-A-Z])([A-Z]+)/g, (_, lower, upper) =>
    lower + '-' + (upper.length > 1 ? upper : upper.toLowerCase())
  ).replace(/^([A-Z]+)/, (_, upper) =>
    upper.length > 1 ? upper + '-' : upper.toLowerCase()
  );

// curry$: enables variable-arity partial application
// e.g., curry$(fn)(a)(b)(c) or curry$(fn)(a, b)(c) or curry$(fn)(a, b, c)
function curry$(f, bound) {
  var context,
  _curry = function(args) {
    return f.length > 1 ? function() {
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}

// slice$: array slice without Array.prototype dependency (for legacy compatibility)
const slice$ = [].slice;

// toString$: Object.prototype.toString for type checking
const toString$ = Object.prototype.toString;

module.exports = { lines, unlines, capitalize, camelize, dasherize, curry$, slice$, toString$ };