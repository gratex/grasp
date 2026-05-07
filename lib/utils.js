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

module.exports = { lines, unlines, capitalize, camelize, dasherize };