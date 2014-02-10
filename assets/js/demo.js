// Generated by LiveScript 1.2.0
(function(){
  var path, FileSystem, Process, run, process, fs;
  path = require('path');
  FileSystem = require('./fs');
  Process = require('./process');
  run = require('./command').run;
  process = new Process;
  window.process = process;
  fs = new FileSystem(process);
  fs.writeFileSync('a.js', 'function g(x) {\n  if (x && f(x)) { return [1, 2]; }\n  doSomething();\n  while(x < 2) {\n    if (xs.length && ys.length) {\n      return xs[x] + ys[x];\n    }\n    x++;\n  }\n  if (x == 3 && list[x]) {\n    return list;\n  }\n}\n');
  fs.writeFileSync('b.js', 'function g(x, str) {\n  if (x == null) { return; }\n  if (x < 2) { return x + 2; }\n  switch (n) {\n    case 1:\n      f({x: str});\n      try {\n        zz(o);\n      } catch (e) {\n        return e;\n      }\n    case 2:\n      return \'>>\' + str.slice(2);\n  }\n  return f(z) + x;\n}\n');
  fs.writeFileSync('c.js', 'f(x < y, x == z);\n');
  $.terminal.ansi_colors.normal = {
    black: '#000',
    red: '#dc322f',
    green: '#859900',
    yellow: '#b58900',
    blue: '#268bd2',
    magenta: '#d33682',
    cyan: '#2aa198',
    white: '#839496'
  };
  $(function(){
    var $demo;
    $demo = $('#demo-terminal');
    return $demo.terminal(function(args, term){
      return run({
        callback: function(it){
          return term.echo(it, {
            raw: true
          });
        },
        error: term.error,
        term: term,
        fs: fs,
        process: process
      }, args);
    }, {
      greetings: '',
      enabled: false,
      keydown: function(e, term){
        var ref$;
        if (((ref$ = e.which || e.keyCode) === 67 || ref$ === 90) && e.ctrlKey) {
          return term.resume();
        }
      },
      prompt: function(it){
        return it(process.cwd() + '[[;#b58900;]$] ');
      }
    });
  });
}).call(this);