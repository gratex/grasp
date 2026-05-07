// Refactored from LiveScript - removed IIFE, var→const/let (curry$, slice$, toString$ now in lib/utils.js)

const path = require('path');
const squery = require('@gjax/grasp-squery');
const equery = require('grasp-equery');
const async = require('async');
const minimatch = require('minimatch');
const flowParser = require('flow-parser');
// Phase 14: replaced prelude-ls with native JS + lib/utils.js
const { lines, unlines, curry$, slice$, toString$ } = require('./utils');
const format = require('./format');
const formatResult = format.formatResult;
const formatName = format.formatName;
const formatCount = format.formatCount;
const replace = require('./replace').replace;
ref$ = require('./options');
const parseOptions = ref$.parse;
const generateHelp = ref$.generateHelp;
const generateHelpForOption = ref$.generateHelpForOption;
const help = require('./help');
const _console = console;
const version = require('../package.json').version;
let run;  // Forward declaration - used in curry$ before being defined
// getQueryEngine removed - now defined inline at end of run function

run = function(arg$){
    const argObj = arg$ != null ? arg$ : {};
    const args = argObj.args;
    const error = argObj.error != null ? argObj.error : it => { throw new Error(it); };
    const callback = argObj.callback != null ? argObj.callback : () => {};
    const exit = argObj.exit != null ? argObj.exit : () => {};
    const data = argObj.data != null ? argObj.data : false;
    const stdin = argObj.stdin;
    const fs = argObj.fs != null ? argObj.fs : require('fs');
    const textFormat = argObj.textFormat != null ? argObj.textFormat : require('cli-color');
    const input = argObj.input;
    const console = argObj.console != null ? argObj.console : _console;
    if (args == null) {
      error('Error: Must specify arguments.');
      exit(2);
      return;
    }
    let options, positional, debug;
    try {
      options = parseOptions(args);
      positional = options._;
      debug = options.debug;
    } catch (e) {
      error(e.message);
      exit(2);
      return;
    }
    if (debug) {
      console.time('everything');
      console.log('options:');
      console.log(options);
    }
    if (options.version) {
      const versionString = "grasp v" + version;
      callback(versionString);
      exit(0, versionString);
      return;
    }
    getHelp = function(positional){
      positional == null && (positional = []);
      return help(generateHelp, generateHelpForOption, positional, {
        version: version
      });
    };
    if (options.help) {
      const helpString = getHelp(positional);
      callback(helpString);
      exit(0, helpString);
      return;
    }
    const queryEngine = options.engine != null
      ? require(options.engine)
      : options.squery
        ? squery
        : options.equery ? equery : squery;
    const parserRef = (function(){
      switch (options.parser[0]) {
      case 'flow-parser':
        return [flowParser, options.parser[1]];
      default:
        return [require(options.parser[0]), options.parser[1]];
      }
    }());
    const parser = parserRef[0];
    const parserOptions = parserRef[1];
    options.context == null && (options.context = options.NUM != null ? options.NUM : 0);
    options.beforeContext == null && (options.beforeContext = options.context);
    options.afterContext == null && (options.afterContext = options.context);
    let selector, targets;
    if (options.file != null) {
      try {
        selector = fs.readFileSync(options.file, 'utf8');
      } catch (e) {
        error("Error: No such file '" + options.file + "'.");
        exit(2);
        return;
      }
      targets = positional;
    } else {
      selector = positional[0];
      targets = slice$.call(positional, 1);
    }
    if (!targets.length) {
      targets = options.recursive
        ? ['.']
        : ['-'];
    }
    const targetsLen = targets.length;
    let replacement;
    if (options.replace != null) {
      replacement = options.replace;
    }
    if (options.replaceFunc) {
      replacement = options.replaceFunc;
    } else if (options.replaceFile) {
      try {
        replacement = fs.readFileSync(options.replaceFile, 'utf8').replace(/([\s\S]*?)\r?\n$/, '$1');
      } catch (e) {
        error("Error: No such file '" + options.replaceFile + "'.");
        exit(2);
        return;
      }
    }
    if (selector == null) {
      error('Error: No selector specified.');
      const helpString = getHelp();
      callback(helpString);
      exit(2, helpString);
      return;
    }
    if (options.filename != null) {
      options.displayFilename = options.filename;
    } else if (targetsLen > 1) {
      options.displayFilename = true;
    } else {
      let isDir;
      try {
        isDir = targets[0] === '-'
          ? false
          : fs.lstatSync(targets[0]).isDirectory();
        if (isDir && !options.recursive) {
          console.warn("'" + targets[0] + "' is a directory. Use '-r, --recursive' to recursively search directories.");
        }
        options.displayFilename = isDir;
      } catch (e) {
        error("Error: No such file or directory '" + targets[0] + "'.");
        exit(2);
        return;
      }
    }
    const colorTransform = it => options.color ? it : (it => it + "");
    const color = Object.fromEntries(
      Object.entries({
        green: textFormat.green,
        cyan: textFormat.cyan,
        magenta: textFormat.magenta,
        red: textFormat.red
      }).map(([k, v]) => [k, colorTransform(v)])
    );
    const bold = options.bold
      ? textFormat.bold
      : it => it + "";
    const textFormatFuncs = {
      color,
      bold
    };
    const resultsData = [];
    let resultsFormat = 'default';
    const callCallback = !options.quiet && !options.json && !options.to && !options.inPlace;
    const out = function(it){
      resultsData.push(it);
      if (callCallback) {
        callback(it);
      }
    };
    if (debug) {
      console.time('parse-selector');
    }
    const parsedSelector = queryEngine.parse(selector);
    if (debug) {
      console.timeEnd('parse-selector');
      console.log('parsed-selector:');
      console.log(JSON.stringify(parsedSelector, null, 2));
    }
    const resultsSortFunc = (a, b) => {
      const aStart = a.loc.start;
      const bStart = b.loc.start;
      const lineDiff = aStart.line - bStart.line;
      if (lineDiff === 0) {
        return aStart.column - bStart.column;
      } else {
        return lineDiff;
      }
    };
    const search = function(name, input){
      if (debug) {
        console.time("search-total:" + name);
      }
      const cleanInput = input.replace(/\r\n/g, '\n').replace(/^#!.*\n/, '');
      let parsedInput;
      try {
        if (debug) {
          console.time("parse-input:" + name);
        }
        parsedInput = parser.parse(cleanInput, parserOptions);
        if (debug) {
          console.timeEnd("parse-input:" + name);
        }
        if (options.printAst) {
          console.log(JSON.stringify(parsedInput, null, 2));
        }
      } catch (e) {
        throw new Error("Error: Could not parse JavaScript from '" + name + "'. " + e.message);
      }
      if (debug) {
        console.time("query:" + name);
      }
      const results = queryEngine.queryParsed(parsedSelector, parsedInput);
      if (debug) {
        console.timeEnd("query:" + name);
      }
      const resultsLen = results.length;
      const count = options.maxCount != null ? Math.min(options.maxCount, resultsLen) : resultsLen;
      const sortedResults = [...results].sort(resultsSortFunc);
      const slicedResults = slice$.call(sortedResults, 0, count);
      if (replacement != null) {
        try {
          const replaced = replace(replacement, cleanInput, slicedResults, queryEngine);
          if (options.to || options.inPlace) {
            resultsFormat = 'pairs';
            out([name, replaced]);
          } else {
            out(replaced);
          }
        } catch (e) {
          console.error(name + ": Error during replacement. " + e.message + ".");
        }
      } else if (options.count) {
        if (options.displayFilename) {
          if (options.json || data) {
            resultsFormat = 'pairs';
            out([name, count]);
          } else {
            out(formatCount(color, count, name));
          }
        } else {
          out(options.json || data
            ? count
            : formatCount(color, count));
        }
      } else if (options.filesWithoutMatch || options.filesWithMatches) {
        if (options.filesWithMatches && count || options.filesWithoutMatch && !count) {
          out(options.json || data
            ? name
            : formatName(color, name));
        }
      } else {
        if (options.json || data) {
          if (options.displayFilename) {
            resultsFormat = 'pairs';
            out([name, slicedResults]);
          } else {
            resultsFormat = 'lists';
            out(slicedResults);
          }
        } else {
          const inputLines = lines(cleanInput);
          const inputLinesLength = cleanInput.length;
          for (const result of slicedResults) {
            out(formatResult(name, inputLines, inputLinesLength, textFormatFuncs, options, result));
          }
        }
      }
      if (debug) {
        console.timeEnd("search-total:" + name);
      }
    };
    const processResults = function(){
      if (resultsData.length) {
        if (resultsFormat === 'pairs') {
          return Object.fromEntries(resultsData);
        } else if (resultsFormat === 'lists') {
          if (targetsLen === 1) {
            return resultsData[0];
          } else {
            return resultsData;
          }
        } else {
          return resultsData;
        }
      } else {
        return [];
      }
    };
    const getToMap = function(inputPaths){
      if (options.inPlace) {
        return Object.fromEntries(inputPaths.map(k => [k, k]));
      } else if (toString$.call(options.to).slice(8, -1) === 'Object') {
        return options.to;
      } else {
        const mapping = {};
        for (const inputPath of inputPaths) {
          mapping[inputPath] = options.to.replace(/%/, path.basename(inputPath, path.extname(inputPath)));
        }
        return mapping;
      }
    };
    const end = function(inputPaths){
      const exitCode = resultsData.length ? 0 : 1;
      const processedResults = processResults();
      let jsonString;
      if (replacement && options.to || options.inPlace) {
        const toMap = getToMap(inputPaths);
        for (const inputPath in processedResults) {
          const contents = processedResults[inputPath];
          const targetPath = toMap[inputPath];
          if (targetPath === '-') {
            callback(contents);
          } else {
            if (targetPath) {
              fs.writeFileSync(targetPath, contents);
            }
          }
        }
      } else if (options.json) {
        jsonString = JSON.stringify(processedResults);
        callback(jsonString);
      }
      if (debug) {
        console.timeEnd('everything');
      }
      return exit(exitCode, options.json ? jsonString : processedResults);
    };
    const exts = options.extensions;
    const testExt = exts.length === 0 || exts.length === 1 && exts[0] === '.'
      ? () => true
      : it => it.match(RegExp('\\.(?:' + exts.join('|') + ')$'));
    const exclude = options.exclude;
    const testExclude = !exclude || exclude.length === 0
      ? () => true
      : (file, basePath, upPath) => {
        const filePath = path.relative(basePath, path.join(upPath, file));
        return exclude.every(excludePattern => !minimatch(filePath, excludePattern, options.minimatchOptions));
      };
    const targetPaths = [];
    const searchTarget = function(basePath, upPath){
      return function(target, done){
        try {
          if (target === '-') {
            if (!stdin) {
              throw new Error('Error: stdin not defined.');
            }
            targetPaths.push('-');
            let output = '';
            stdin.setEncoding('utf-8');
            stdin.on('data', it => { output += it; });
            stdin.on('end', function(){
              try {
                search('(standard input)', output);
              } catch (e) {
                console.error(e.message);
              }
              return done();
            });
            stdin.resume();
          } else {
            const targetPath = path.resolve(upPath, target);
            const stat = fs.lstatSync(targetPath);
            if (stat.isDirectory() && options.recursive) {
              async.eachSeries(fs.readdirSync(targetPath), searchTarget(basePath, targetPath), function(){
                return async.setImmediate(function(){
                  return done();
                });
              });
            } else if (stat.isFile() && testExt(target) && testExclude(target, basePath, upPath)) {
              const fileContents = fs.readFileSync(targetPath, 'utf8');
              const displayPath = path.relative(basePath, targetPath).replace(/\\/g, '/');
              targetPaths.push(displayPath);
              search(displayPath, fileContents);
              done();
            } else {
              done();
            }
          }
        } catch (e) {
          console.error(e.message);
          done();
        }
      };
    };
    if (input) {
      search('(input)', input);
      return end(['-']);
    } else {
      const cwd = process.cwd();
      async.eachSeries(targets, searchTarget(cwd, cwd), function(){
        return end(targetPaths);
      });
    }
  };
  const getQueryEngine = function(it){
    return {
      squery: '@gjax/grasp-squery',
      equery: 'grasp-equery'
    }[it] || it;
  };
  run.VERSION = version;
  run.search = curry$(function(engine, selector, input){
    return run({
      args: {
        _: [selector],
        engine: getQueryEngine(engine)
      },
      input: input,
      data: true,
      exit: function(arg$, results){
        return results;
      }
    });
  });
  run.replace = curry$(function(engine, selector, replacement, input){
    var args;
    args = {
      _: [selector],
      engine: getQueryEngine(engine)
    };
    if (toString$.call(replacement).slice(8, -1) === 'Function') {
      args.replaceFunc = replacement;
    } else {
      args.replace = replacement;
    }
    return run({
      args: args,
      input: input,
      exit: function(arg$, results){
        return results[0];
      }
    });
  });
  module.exports = run;
