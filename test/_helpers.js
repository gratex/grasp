// Refactored from LiveScript - removed IIFE, var→const/let
// Phase 14: replaced prelude-ls with native JS
const grasp = require('..');
const clc = require('cli-color');
const path = require('path');
const assert = require('assert');
const { toString$ } = require('../lib/utils');
const EventEmitter = require('events').EventEmitter;

const equal = assert.strictEqual;
const deepEqual = assert.deepEqual;
const throws = assert.throws;

// Helper functions (from LiveScript runtime)
function bind$(obj, key, target) {
  return function() { return (target || obj)[key].apply(obj, arguments); };
}

function extend$(sub, sup) {
  function fun() {}
  fun.prototype = (sub.superclass = sup).prototype;
  (sub.prototype = new fun).constructor = sub;
  if (typeof sup.extended === 'function') sup.extended(sub);
  return sub;
}

function import$(obj, src) {
  const own = {}.hasOwnProperty;
  for (const key in src) if (own.call(src, key)) obj[key] = src[key];
  return obj;
}

// StdIn extends EventEmitter
const StdIn = (function(superclass) {
  const prototype = extend$((import$(StdIn, superclass).displayName = 'StdIn', StdIn), superclass).prototype;
  const constructor = StdIn;
  
  function StdIn(data) {
    let this$ = this instanceof ctor$ ? this : new ctor$();
    this$.data = data;
    this$.emitData = bind$(this$, 'emitData', prototype);
    this$.currentLine = 0;
    const ref$ = this$.data;
    this$.dataLen = ref$ != null ? ref$.length : undefined;
    return this$;
  }
  
  function ctor$() {}
  ctor$.prototype = prototype;
  
  StdIn.prototype.emitData = function() {
    this.emit('data', this.data[this.currentLine]);
    this.currentLine++;
    if (this.currentLine === this.dataLen) {
      clearInterval(this.interval);
      return this.emit('end');
    }
  };
  
  StdIn.prototype.resume = function() {
    return this.interval = setInterval(this.emitData, 5);
  };
  
  StdIn.prototype.setEncoding = function() {};
  
  return StdIn;
}(EventEmitter));

// FileSystem mock
const FileSystem = (function() {
  FileSystem.displayName = 'FileSystem';
  const prototype = FileSystem.prototype;
  const constructor = FileSystem;
  
  function FileSystem(files) {
    let name, info;
    this.files = {};
    for (name in files) {
      info = files[name];
      this.files[path.join(process.cwd(), name)] = info;
    }
  }
  
  FileSystem.prototype.readFileSync = function(targetPath) {
    let node;
    node = this.files[path.resolve(targetPath)];
    if (node.type === 'directory') {
      throw new Error(targetPath + " is directory");
    } else {
      return node.contents;
    }
  };
  
  FileSystem.prototype.readDirSync = function(targetPath) {
    let node;
    node = this.files[path.resolve(targetPath)];
    if (node.type === 'file') {
      throw new Error(targetPath + " is file");
    } else {
      return Object.keys(node);
    }
  };
  
  FileSystem.prototype.lstatSync = function(targetPath) {
    let node;
    node = this.files[path.resolve(targetPath)];
    return {
      isDirectory: function() {
        return node.type === 'directory';
      },
      isFile: function() {
        return node.type === 'file';
      }
    };
  };
  
  return FileSystem;
}());

const q = function(args, opts) {
  opts == null && (opts = {});
  opts.args = args;
  return grasp(opts);
};

const testFunc = function(type, o, quiet) {
  return function(result) {
    let expectedVal, expectedRealVal, e;
    if (quiet) {
      throw new Error('Unexpected result - quiet is on.');
    }
    try {
      expectedVal = o.expected[o.i];
      while (!(o.callback || toString$.call(expectedVal).slice(8, -1) === 'Object')) {
        ++o.i;
        expectedVal = o.expected[o.i];
      }
      if (type === 'callback') {
        expectedRealVal = expectedVal;
      } else {
        if (!(expectedVal != null && expectedVal.funcType)) {
          throw new Error("Expected callback, but got " + type + " instead, with result: " + result + ".");
        }
        equal(type, expectedVal != null ? expectedVal.funcType : undefined);
        expectedRealVal = expectedVal != null ? expectedVal.value : undefined;
      }
      switch (toString$.call(expectedRealVal).slice(8, -1)) {
        case 'RegExp':
          assert(expectedRealVal.test(toString$.call(result).slice(8, -1) === 'String'
            ? result
            : JSON.stringify(result)), 'RegExp did not pass');
          break;
        default:
          deepEqual(result, expectedRealVal);
      }
      ++o.i;
    } catch (e$) {
      e = e$;
      console.log(o.expected);
      console.log(o.i);
      console.log("\n" + type);
      console.log('---');
      console.log(result);
      console.log(expectedRealVal);
      console.log('---');
      console.log(JSON.stringify(result));
      console.log(JSON.stringify(expectedRealVal));
      throw e;
    }
  };
};

const embolden = function(it) {
  if (toString$.call(it).slice(8, -1) === 'String') {
    return it.replace(/##/g, '\u001b[1m').replace(/#/g, '\u001b[22m');
  } else {
    return it;
  }
};

const eq = function(argString, expected, done, arg$) {
  let ref$, quiet, data, color, callback, ref1$, stdin, fs, input, dir, final, textFormat, expectedFormatted, args, expectedLen, o, options;
  ref$ = arg$ != null
    ? arg$
    : {};
  quiet = ref$.quiet;
  data = ref$.data;
  color = ref$.color;
  callback = (ref1$ = ref$.callback) != null ? ref1$ : true;
  stdin = ref$.stdin;
  fs = ref$.fs;
  input = ref$.input;
  dir = ref$.dir;
  final = ref$.final;
  textFormat = ref$.textFormat;
  
  if (dir) {
    process.chdir(dir);
  }
  expectedFormatted = [].concat(expected).map(embolden);
  args = argString == null
    ? null
    : color
      ? argString
      : "--no-color " + argString;
  expectedLen = expectedFormatted.length;
  o = {
    i: 0,
    expected: expectedFormatted,
    callback: callback
  };
  options = {
    console: {
      log: testFunc('log', o),
      warn: testFunc('warn', o),
      error: testFunc('error', o),
      time: testFunc('time', o),
      timeEnd: testFunc('time-end', o)
    },
    callback: callback ? testFunc('callback', o, quiet) : null,
    error: testFunc('error', o),
    stdin: stdin,
    fs: fs,
    textFormat: textFormat,
    input: input,
    data: data,
    exit: function(exitCode, results) {
      let res, j, i$, ref$, len$, exp, e;
      res = [].concat(results);
      j = 0;
      try {
        if (final) {
          final(results);
        } else {
          for (i$ = 0, len$ = (ref$ = expectedFormatted).length; i$ < len$; ++i$) {
            exp = ref$[i$];
            if (exp.funcType != null) {
              continue;
            }
            switch (toString$.call(exp).slice(8, -1)) {
              case 'RegExp':
                assert(exp.test(res[j]), 'RegExp did not pass');
                break;
              default:
                deepEqual(exp, res[j]);
            }
            j++;
          }
        }
      } catch (e$) {
        e = e$;
        console.log('\n');
        console.log('ERROR with final value compare');
        console.log(res);
        console.log(expectedFormatted);
        console.log(JSON.stringify(res));
        console.log(JSON.stringify(expectedFormatted));
        throw e;
      }
      return done();
    }
  };
  if (options.callback == null) {
    o.callback = false;
  }
  q(args, options);
};

module.exports = {
  grasp: grasp,
  eq: eq,
  q: q,
  StdIn: StdIn,
  FileSystem: FileSystem
};
