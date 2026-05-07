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
    let noFilters;
    let origResults;
    let filters;
    let selector;
    let that;
    let e;
    let results;
    let rawPrepend;
    let rawAppend;
    let join;
    let textOperations;
    let filterName;
    let argsStr;
    let args;
    let ref1;
    let pre;
    let post;
    let i;
    let len;
    let result;
    let n;
    let l;
    let rawResults;
    let res;
    let outputString;
    let ref;
    
    noFilters = false;
    if (/^\s*\|\s+/.test(replacementArg)) {
      origResults = [node];
      ref = (" " + replacementArg.trim()).split(filterRegex);
      filters = ref.slice(1);
    } else {
      ref = replacementArg.trim().split(filterRegex);
      selector = ref[0];
      filters = ref.slice(1);
      if (that = (ref = node._named) != null ? ref[selector] : void 8) {
        origResults = [].concat(that);
      } else {
        try {
          origResults = queryEngine.query(selector, node);
        } catch (e$) {
          e = e$;
          noFilters = true;
        }
      }
    }
    if (noFilters || !origResults.length) {
      origResults = queryEngine.query(replacementArg, node);
      filters = [];
    }
    if (origResults.length) {
      results = origResults;
      rawPrepend = '';
      rawAppend = '';
      join = null;
      textOperations = [];
      while (filters.length) {
        filterName = filters.shift();
        argsStr = filters.shift().trim();
        argsStr += filters.shift();
        args = levn.parse('Array', argsStr);
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
          ref1 = args.length === 1 ? [args[0], args[0]] : args;
          pre = ref1[0];
          post = ref1[1];
          rawPrepend = pre + "" + rawPrepend;
          rawAppend += post + "";
          break;
        case 'prepend':
          for (i = 0, len = args.length; i < len; ++i) {
            arg = args[i];
            results.unshift({
              type: 'Raw',
              raw: arg + ""
            });
          }
          break;
        case 'append':
          for (i = 0, len = args.length; i < len; ++i) {
            arg = args[i];
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
            for (i = 0, len = results.length; i < len; ++i) {
              result = results[i];
              result.rawPrepend = args[1] + "" + ((ref1 = result.rawPrepend) != null ? ref1 : '');
            }
            break;
          case 'after':
            for (i = 0, len = results.length; i < len; ++i) {
              result = results[i];
              result.rawAppend = ((ref1 = result.rawAppend) != null ? ref1 : '') + "" + args[1];
            }
            break;
          case 'wrap':
            ref1 = args.length === 2
              ? [args[1], args[1]]
              : [args[1], args[2]];
            pre = ref1[0];
            post = ref1[1];
            for (i = 0, len = results.length; i < len; ++i) {
              result = results[i];
              result.rawPrepend = pre + "" + ((ref1 = result.rawPrepend) != null ? ref1 : '');
              result.rawAppend = ((ref1 = result.rawAppend) != null ? ref1 : '') + "" + post;
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
            textOperations.push(function(it) {
              return it.substr(args[0], args[1]);
            });
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
      res = [];
      for (i = 0, len = results.length; i < len; ++i) {
        result = results[i];
        res.push(getRaw(input, result));
      }
      rawResults = res;
      outputString = rawPrepend + "" + (join != null
        ? rawResults.join(join)
        : rawResults[0]) + rawAppend;
      if (textOperations.length) {
        return textOperations.reduce(function(x, y) {
          return y(x);
        }, outputString);
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
  let inputLines;
  let colOffset;
  let lineOffset;
  let lastLine;
  let prevNode;
  let replaceNode;
  let i;
  let len;
  let node;
  let ref;
  let ref1;
  let ref2;
  let start;
  let end;
  let startLineNum;
  let endLineNum;
  let numberOfLines;
  let startCol;
  let endCol;
  let replaceLines;
  let startLine;
  let endLine;
  let startContext;
  let endContext;
  let replaceLast;
  let endLen;
  
  inputLines = lines(input);
  colOffset = 0;
  lineOffset = 0;
  lastLine = null;
  prevNode = {
    range: [0, 0]
  };
  replaceNode = getReplacementFunc(replacement, input, queryEngine);
  for (i = 0, len = nodes.length; i < len; ++i) {
    node = nodes[i];
    if (((ref = node.range) != null ? ref[0] : void 8) < ((ref1 = prevNode.range) != null ? ref1[1] : void 8)) {
      continue;
    }
    ref2 = node.loc;
    start = ref2.start;
    end = ref2.end;
    startLineNum = start.line - 1 + lineOffset;
    endLineNum = end.line - 1 + lineOffset;
    numberOfLines = endLineNum - startLineNum + 1;
    colOffset = lastLine === startLineNum ? colOffset : 0;
    startCol = start.column + colOffset;
    endCol = end.column + (startLineNum === endLineNum ? colOffset : 0);
    replaceLines = lines(replaceNode(node));
    startLine = inputLines[startLineNum];
    endLine = inputLines[endLineNum];
    startContext = startLine.slice(0, startCol);
    endContext = endLine.slice(endCol);
    replaceLines[0] = startContext + "" + ((ref2 = replaceLines[0]) != null ? ref2 : '');
    replaceLast = replaceLines[replaceLines.length - 1];
    endLen = replaceLast.length;
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
