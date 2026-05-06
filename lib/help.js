// Refactored from LiveScript - removed IIFE, var→const/let, replaced repeatString$ with String.repeat()
const { map, flatten, join, lines, unlines, chars, unchars } = require('prelude-ls');
const { syntax, syntaxFlat, aliasMap, attrMapInverse, matchesMap, matchesAliasMap } = require('grasp-syntax-javascript');
const { pad } = require('./text');
const { options } = require('./options');

function generateSyntaxHelp() {
  let maxNameLen = 0;
  const syntaxInfo = [];

  for (const [category, nodesInCat] of Object.entries(syntax)) {
    const categoryResult = [];
    for (const [nodeName, nodeData] of Object.entries(nodesInCat)) {
      const alias = nodeData.alias;
      const nodes = nodeData.nodes || [];
      const nodeArrays = nodeData.nodeArrays || [];
      const primitives = nodeData.primitives || [];

      const getFieldStrings = (type, fields) => {
        return map(field => {
          const aliases = attrMapInverse[field];
          if (aliases) {
            return type + field + " (" + type + aliases.join(", " + type) + ")";
          } else {
            return type + field;
          }
        }, fields);
      };

      const fieldStrings = getFieldStrings('', nodes).concat(
        getFieldStrings('%', nodeArrays),
        getFieldStrings('&', primitives)
      );

      const nameString = alias + " (" + nodeName + ")";
      maxNameLen = Math.max(maxNameLen, nameString.length);
      categoryResult.push([nameString, fieldStrings.join(', ')]);
    }
    syntaxInfo.push(categoryResult);
  }

  const syntaxInfoStrings = map(nodesInfo => {
    return '\n' + unlines(nodesInfo.map(([name, fields]) => pad(name, maxNameLen) + "  " + fields));
  }, syntaxInfo);

  const prepend = 'JavaScript abstract syntax help:\na list of possible node types, and their fields\n`--help node-name` for more information about a node\n`--help categories` for information about categories of nodes\n\nnode-name (FullOfficialName)   field1, field2 (alias), field3...\nfield  - this field contains another node\n%field - this field contains an array of other nodes\n&field - this field contains a primitive value, such as a boolean or a string\n-----------------------------';
  const append = 'Based on the Mozilla Parser API <https://developer.mozilla.org/docs/SpiderMonkey/Parser_API>';

  return prepend + unlines(syntaxInfoStrings) + "\n\n" + append;
}

function generateSyntaxHelpForNode(nodeName) {
  const nodeData = syntaxFlat[nodeName];
  const alias = nodeData.alias;
  const nodes = nodeData.nodes;
  const nodeArrays = nodeData.nodeArrays;
  const primitives = nodeData.primitives;
  const syntax = nodeData.syntax;
  const example = nodeData.example;
  const note = nodeData.note;

  const nameStr = alias + " (" + nodeName + ")";
  const strs = [];

  for (const [type, fields] of [['node', nodes], ['node array', nodeArrays], ['primitive', primitives]]) {
    if (fields) {
      strs.push('\n' + type + " fields: " + map(field => {
        const aliases = attrMapInverse[field];
        if (aliases) {
          return field + " (alias: " + aliases.join(', ') + ")";
        } else {
          return field;
        }
      }, fields).join(', '));
    }
  }

  let syntaxStr = '';
  if (syntax) {
    syntaxStr = "\nsyntax:\n" + unlines(map(line => "  " + line, lines(syntax)));
  }

  let exampleStr = '';
  if (example) {
    const examples = [].concat(example).map(ex => {
      return unlines(lines(ex).map(line => "  " + line));
    });
    exampleStr = "\nexample" + (examples.length > 1 ? 's' : '') + ":\n" + unlines(examples);
  }

  const noteStr = note ? "\nnote: " + note : '';

  return nameStr + "\n" + "=".repeat(nameStr.length) + unchars(strs) + syntaxStr + exampleStr + noteStr;
}

function generateCategoryHelp() {
  const categories = [];

  for (const [alias, category] of Object.entries(matchesAliasMap)) {
    const fullNodeNames = matchesMap[category];
    const names = map(node => syntaxFlat[node].alias, fullNodeNames);
    categories.push(alias + " (" + category + "): " + names.join(', '));
  }

  const prepend = 'Categories of node types:';
  const append = '`--help syntax` for node information.\n`--help category-name` for further information about a category.';

  return prepend + "\n\n" + unlines(categories) + "\n\n" + append;
}

function generateHelpForCategory(name) {
  const invertedAliases = {};
  for (const [key, value] of Object.entries(matchesAliasMap)) {
    invertedAliases[value] = key;
  }

  const alias = invertedAliases[name];
  const fullNodeNames = matchesMap[name];
  const names = map(node => syntaxFlat[node].alias + " (" + node + ")", fullNodeNames);
  const nameStr = alias + " (" + name + ")";

  return "A node type category.\n\n" + nameStr + "\n" + "=".repeat(nameStr.length) + "\n" + unlines(names);
}

module.exports = function(generateHelp, generateHelpForOption, positional, interpolate) {
  if (positional.length) {
    const helpStrings = [];

    for (const arg of positional) {
      const lresult = [];

      if (arg === 'advanced') {
        lresult.push(generateHelp({ showHidden: true, interpolate }));
      } else {
        const match = /^(--?)(\S+)/.exec(arg);
        if (match) {
          const [dashes, optionName] = [match[1], match[2]];
          if (dashes.length === 2) {
            lresult.push(generateHelpForOption(optionName));
          } else {
            for (const o of chars(optionName)) {
              lresult.push(generateHelpForOption(o));
            }
          }
        } else if (arg === 'more') {
          lresult.push(generateHelpForOption('help'));
        } else if (arg === 'verbose') {
          for (const item of options) {
            if (item.heading) {
              const sep = '#'.repeat(item.heading.length + 4);
              lresult.push(sep + "\n# " + item.heading + " #\n" + sep);
            } else {
              lresult.push(generateHelpForOption(item.option));
            }
          }
        } else if (arg === 'syntax') {
          lresult.push(generateSyntaxHelp());
        } else if (arg === 'categories') {
          lresult.push(generateCategoryHelp());
        } else {
          if (aliasMap[arg] || syntaxFlat[arg]) {
            const name = aliasMap[arg] || arg;
            lresult.push(generateSyntaxHelpForNode(name));
          } else if (matchesMap[arg] || matchesAliasMap[arg]) {
            const name = matchesAliasMap[arg] || arg;
            lresult.push(generateHelpForCategory(name));
          } else {
            lresult.push("No such help option: " + arg + ".");
          }
        }
      }

      helpStrings.push(lresult);
    }

    return join('\n\n')(flatten(helpStrings));
  } else {
    return generateHelp({ interpolate });
  }
};
