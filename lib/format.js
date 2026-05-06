// Refactored from LiveScript - removed IIFE, var→const/let, replaced compose$ with arrow fn
const { id, compact, unlines, min, max } = require('prelude-ls');
const slash = require('slash');

const compose = (...functions) => {
  return function() {
    let result = functions[0].apply(this, arguments);
    for (let i = 1; i < functions.length; ++i) {
      result = functions[i](result);
    }
    return result;
  };
};

function formatResult(name, inputLines, inputLinesLength, { color, bold }, options, node) {
  const resStartLine = node.loc.start.line - 1;
  const startLine = max(resStartLine - options.beforeContext, 0);
  const resEndLine = node.loc.end.line - 1;
  const endLine = min(resEndLine + options.afterContext, inputLinesLength - 1);
  const startCol = node.loc.start.column;
  const endCol = node.loc.end.column;
  const highlight = compose(bold, color.red);
  const onlyMatch = options.onlyMatching;

  const outputLines = [];
  for (let i = startLine; i <= endLine; ++i) {
    const lineNum = i;
    const line = inputLines[lineNum];
    if (lineNum < resStartLine || lineNum > resEndLine) {
      if (onlyMatch) {
        outputLines.push('');
      } else {
        outputLines.push(line);
      }
    } else if (lineNum === resStartLine && resStartLine === resEndLine) {
      const start = onlyMatch ? '' : line.slice(0, startCol);
      const middle = line.slice(startCol, endCol);
      const end = onlyMatch ? '' : line.slice(endCol);
      outputLines.push(start + highlight(middle) + end);
    } else if (resStartLine < lineNum && lineNum < resEndLine) {
      outputLines.push(highlight(line));
    } else if (lineNum === resStartLine) {
      const start = onlyMatch ? '' : line.slice(0, startCol);
      const rest = line.slice(startCol);
      outputLines.push(start + highlight(rest));
    } else {
      const end = onlyMatch ? '' : line.slice(endCol);
      const rest = line.slice(0, endCol);
      outputLines.push(highlight(rest) + end);
    }
  }

  let cleanLines = onlyMatch ? compact(outputLines) : id(outputLines);
  const multiline = cleanLines.length > 1;
  if (multiline && options.joinMultilines) {
    cleanLines = [cleanLines.map(it => it.trim()).join(' ')];
  }
  const outputString = unlines(cleanLines);

  const displayStartLine = node.loc.start.line;
  const displayEndLine = node.loc.end.line;

  let locationString;
  if (options.colNumber) {
    locationString = color.green(
      (options.lineNumber ? displayStartLine + ',' : '') + startCol
    ) + color.cyan('-') + color.green(
      (options.lineNumber ? displayEndLine + ',' : '') + (endCol - 1)
    );
  } else if (options.lineNumber) {
    if (multiline) {
      locationString = displayStartLine === displayEndLine
        ? color.green(displayStartLine)
        : color.green(displayStartLine) + color.green('-') + color.green(displayEndLine);
    } else {
      locationString = color.green(displayStartLine);
    }
  } else {
    locationString = '';
  }

  const separatorString = (
    multiline && options.multilineSeparator
      ? color.cyan((locationString.length ? ':' : '') + '(multiline)')
      : ''
  ) + (
    locationString.length || (multiline && options.multilineSeparator)
      ? color.cyan(':')
      : ''
  ) + (
    multiline && (locationString.length || options.multilineSeparator)
      ? '\n'
      : ''
  );

  const nameString = options.displayFilename ? formatName(color, name) + color.cyan(':') : '';
  return nameString + locationString + separatorString + outputString;
}

function formatName(color, name) {
  name = process.env.MSYSTEM ? slash(name) : name;
  return color.magenta(name);
}

function formatCount(color, count, name) {
  return (name ? formatName(color, name) + color.cyan(':') : '') + count;
}

module.exports = {
  formatResult,
  formatName,
  formatCount
};
