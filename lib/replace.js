// Refactored from LiveScript - removed IIFE, var→const/let, replaced in$() with .includes(), replaced slice$/toString$ helpers
// Phase 14: replaced prelude-ls with native JS + lib/utils.js
const { lines, unlines, capitalize, camelize, dasherize } = require('./utils');
const levn = require('levn');

function getRaw(input, node) {
  let raw;
  let that;
  let start;
  let end;
  raw = (that = node.raw)
    ? that
    : node.range != null
      ? (start = node.range[0], end = node.range[1], input.slice(start, end))
      : node.key != null && node.value != null ? input.slice(node.key.start, node.value.end) : '';
  node.raw = raw;
  return (node.rawPrepend || '') + "" + raw + (node.rawAppend || '');
}

const filterRegex = /\s+\|\s+([-a-zA-Z]+)((?:\s+(?:'(?:\\'|[^'])*'|"(?:\\"|[^"])*"|[^\|\s]+))*)/;

function replacer(input, node, queryEngine) {
  return function(arg, replacementArg) {
    let noFilters = false;
    let ref, origResults, filters;
    if (/^\s*\|\s+/.test(replacementArg)) {
      origResults = [node];
      ref = (" " + replacementArg.trim()).split(filterRegex);
      filters = ref.slice(1);
    } else {
      ref = replacementArg.trim().split(filterRegex);
      let selector = ref[0];
      filters = ref.slice(1);
      let that = (ref = node._named) != null ? ref[selector] : void 8;
      if (that) {
        origResults = [].concat(that);
      } else {
        try {
          origResults = queryEngine.query(selector, node);
        } catch (e) {
          noFilters = true;
        }
      }
    }
    if (noFilters || !origResults.length) {
      origResults = queryEngine.query(replacementArg, node);
      filters = [];
    }
    if (origResults.length) {
      let results = origResults;
      let rawPrepend = '';
      let rawAppend = '';
      let join = null;
      let textOperations = [];
      while (filters.length) {
        let filterName = filters.shift();
        let argsStr = filters.shift().trim();
        argsStr += filters.shift();
        let args = levn.parse('Array', argsStr);
        let n, l, pre, post;
        if (!args.length && (filterName === 'prepend' || filterName === 'before' || filterName === 'after' || filterName === 'prepend' || filterName === 'append' || filterName === 'wrap' || filterName === 'nth' || filterName === 'nth-last' || filterName === 'slice' || filterName === 'each' || filterName === 'replace' || filterName === 'substring' || filterName === 'substr' || filterName === 'str-slice')) {
          throw new Error("No arguments supplied for '" + filterName + "' filter");
        } else if (['replace'].includes(filterName) && args.length < 2) {
          throw new Error("Must supply at least two arguments for '" + filterName + "' filter");
        }
        switch (filterName) {
        case 'join':
          join = args.length ? args[0] + "" : '';
          break;
        case 'before':
          rawPrepend = args[0] + "" + rawPrepend;
          break;
        case 'after':
          rawAppend += args[0] + "";
          break;
        case 'wrap':
          let ref1 = args.length === 1 ? [args[0], args[0]] : args;
          pre = ref1[0];
          post = ref1[1];
          rawPrepend = pre + "" + rawPrepend;
          rawAppend += post + "";
          break;
        case 'prepend':
          for (const arg of args) {
            results.unshift({
              type: 'Raw',
              raw: arg + ""
            });
          }
          break;
        case 'append':
          for (const arg of args) {
            results.push({
              type: 'Raw',
              raw: arg + ""
            });
          }
          break;
        case 'each':
          if (args.length < 2) {
            throw new Error("No arguments supplied for 'each " + args[0] + "'");
          }
          switch (args[0]) {
          case 'before':
            for (const result of results) {
              result.rawPrepend = args[1] + "" + (result.rawPrepend != null ? result.rawPrepend : '');
            }
            break;
          case 'after':
            for (const result of results) {
              result.rawAppend = (result.rawAppend != null ? result.rawAppend : '') + "" + args[1];
            }
            break;
          case 'wrap':
            const ref1 = args.length === 2
              ? [args[1], args[1]]
              : [args[1], args[2]];
            pre = ref1[0];
            post = ref1[1];
            for (const result of results) {
              result.rawPrepend = pre + "" + (result.rawPrepend != null ? result.rawPrepend : '');
              result.rawAppend = (result.rawAppend != null ? result.rawAppend : '') + "" + post;
            }
            break;
          default:
            throw new Error("'" + args[0] + "' is not supported by 'each'");
          }
          break;
        case 'nth':
          n = +args[0];
          results = results.slice(n, n + 1);
          break;
        case 'nth-last':
          n = results.length - +args[0] - 1;
          results = results.slice(n, n + 1);
          break;
        case 'first':
        case 'head':
          results = results.slice(0, 1);
          break;
        case 'tail':
          results = results.slice(1);
          break;
        case 'last':
          l = results.length;
          results = results.slice(l - 1, l);
          break;
        case 'initial':
          results = results.slice(0, results.length - 1);
          break;
        case 'slice':
          results = [].slice.apply(results, args);
          break;
        case 'reverse':
          results.reverse();
          break;
        case 'replace':
          (function(args) {
            textOperations.push(function(it) {
              return it.replace(args[0], args[1]);
            });
          }(args));
          break;
        case 'lowercase':
          textOperations.push(function(it) { return it.toLowerCase(); });
          break;
        case 'uppercase':
          textOperations.push(function(it) { return it.toUpperCase(); });
          break;
        case 'capitalize':
          textOperations.push(capitalize);
          break;
        case 'uncapitalize':
          textOperations.push(function(it) { return it.charAt(0).toLowerCase() + it.slice(1); });
          break;
        case 'camelize':
          textOperations.push(camelize);
          break;
        case 'dasherize':
          textOperations.push(dasherize);
          break;
        case 'trim':
          textOperations.push(function(it) { return it.trim(); });
          break;
        case 'substring':
          (function(args) {
            textOperations.push(function(it) {
              return it.substring(args[0], args[1]);
            });
          }(args));
          break;
        case 'substr':
          (function(args) {
            textOperations.push(it => it.substr(args[0], args[1]));
          }(args));
          break;
        case 'str-slice':
          (function(args) {
            textOperations.push(function(it) {
              return it.slice(args[0], args[1]);
            });
          }(args));
          break;
        default:
          throw new Error("Invalid filter: " + filterName + (argsStr ? " " + argsStr : ''));
        }
      }
      const rawResults = results.map(result => getRaw(input, result));
      const outputString = rawPrepend + "" + (join != null
        ? rawResults.join(join)
        : rawResults[0]) + rawAppend;
      if (textOperations.length) {
        return textOperations.reduce((x, y) => y(x), outputString);
      } else {
        return outputString;
      }
    } else {
      return '';
    }
  };
}

function getReplacementFunc(replacement, input, queryEngine) {
  let replacementPrime;
  if (Object.prototype.toString.call(replacement).slice(8, -1) === 'Function') {
    return function(node) {
      return replacement(function(it) {
        return getRaw(input, it);
      }, node, function(it) {
        return queryEngine.query(it, node);
      }, node._named);
    };
  } else {
    replacementPrime = replacement.replace(/\\n/g, '\n');
    return function(node) {
      return replacementPrime.replace(/{{}}/g, function() {
        return getRaw(input, node);
      }).replace(/{{((?:[^}]|}[^}])+)}}/g, replacer(input, node, queryEngine));
    };
  }
}

function replace(replacement, input, nodes, queryEngine) {
  let inputLines = lines(input);
  let colOffset = 0;
  let lineOffset = 0;
  let lastLine = null;
  let prevNode = {
    range: [0, 0]
  };
  const replaceNode = getReplacementFunc(replacement, input, queryEngine);
  for (const node of nodes) {
    let ref, ref1;
    if (((ref = node.range) != null ? ref[0] : void 8) < ((ref1 = prevNode.range) != null ? ref1[1] : void 8)) {
      continue;
    }
    const ref2 = node.loc;
    const start = ref2.start;
    const end = ref2.end;
    const startLineNum = start.line - 1 + lineOffset;
    const endLineNum = end.line - 1 + lineOffset;
    const numberOfLines = endLineNum - startLineNum + 1;
    colOffset = lastLine === startLineNum ? colOffset : 0;
    const startCol = start.column + colOffset;
    const endCol = end.column + (startLineNum === endLineNum ? colOffset : 0);
    const replaceLines = lines(replaceNode(node));
    const startLine = inputLines[startLineNum];
    const endLine = inputLines[endLineNum];
    const startContext = startLine.slice(0, startCol);
    const endContext = endLine.slice(endCol);
    replaceLines[0] = startContext + "" + (replaceLines[0] != null ? replaceLines[0] : '');
    const replaceLast = replaceLines[replaceLines.length - 1];
    const endLen = replaceLast.length;
    replaceLines[replaceLines.length - 1] = replaceLast + "" + endContext;
    inputLines.splice(startLineNum, numberOfLines);
    inputLines = inputLines.slice(0, startLineNum).concat(replaceLines).concat(inputLines.slice(startLineNum));
    lineOffset += replaceLines.length - numberOfLines;
    colOffset += endLen - endCol;
    lastLine = endLineNum + lineOffset;
    prevNode = node;
  }
  return unlines(inputLines);
}

module.exports = {
  replace: replace
};
