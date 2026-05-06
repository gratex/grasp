// Refactored from LiveScript - removed IIFE, var→const/let
const eq = require('./_helpers').eq;
const assert = require('assert');
const equal = assert.strictEqual;
const fs = require('fs');

suite('replace', function() {
  test('single line same length', function(it) {
    return eq('--replace XX "#zz" test/data/b.js', 'debugger;\nfunction foobar(o) {\n  while (o) {\n    return XX + XX;\n  }\n}\n', it);
  });
  test('single line longer length', function(it) {
    return eq('--replace XXX "#zz" test/data/b.js', 'debugger;\nfunction foobar(o) {\n  while (o) {\n    return XXX + XXX;\n  }\n}\n', it);
  });
  test('single line shorter length', function(it) {
    return eq('--replace X "#zz" test/data/b.js', 'debugger;\nfunction foobar(o) {\n  while (o) {\n    return X + X;\n  }\n}\n', it);
  });
  test('multiple lines to multiple lines', function(it) {
    return eq('--replace "{\n\n    return zz + zz; }" "while block" test/data/b.js', 'debugger;\nfunction foobar(o) {\n  while (o) {\n\n    return zz + zz; }\n}\n', it);
  });
  test('multiple lines to single line', function(it) {
    return eq('--replace "{ return zz + zz; }" "while block" test/data/b.js', 'debugger;\nfunction foobar(o) {\n  while (o) { return zz + zz; }\n}\n', it);
  });
  test('multiple lines to single line with end context', function(it) {
    return eq('--replace "z - foo" bi test/data/dir/c.js', 'var moooo = 23;\nvar x = z - foo; z - foo;\n', it);
  });
  test('single line to multiple lines', function(it) {
    return eq('--replace "return zz +\nzz;" return test/data/b.js', 'debugger;\nfunction foobar(o) {\n  while (o) {\n    return zz +\nzz;\n  }\n}\n', it);
  });
  test('more than two matches in a single line', function(it) {
    return eq('--replace xxx "#y"', 'xxx + xxx + xxx;', it, {
      input: 'y + y + y;'
    });
  });
  test('replace from file', function(it) {
    return eq('--replace-file test/data/replacement debugger test/data/b.js', 'console.log(\'debug\');\nfunction foobar(o) {\n  while (o) {\n    return zz + zz;\n  }\n}\n', it);
  });
  test('replace from file error', function(it) {
    return eq('--replace-file test/data/FAKE debugger test/data/a.js', [{
      funcType: 'error',
      value: "Error: No such file 'test/data/FAKE'."
    }], it);
  });
  test('after selector', function(it) {
    return eq('"#zz" --replace XX test/data/b.js', 'debugger;\nfunction foobar(o) {\n  while (o) {\n    return XX + XX;\n  }\n}\n', it);
  });
  test('replacement with {}', function(it) {
    return eq('--replace "{}" "#zz" test/data/b.js', 'debugger;\nfunction foobar(o) {\n  while (o) {\n    return {} + {};\n  }\n}\n', it);
  });

  suite('whole match replacement', function() {
    test('single line', function(it) {
      return eq('--replace "o({{}}) bi test/data/b.js', 'debugger;\nfunction foobar(o) {\n  while (o) {\n    return o(zz + zz);\n  }\n}\n', it);
    });
    test('single line multiple', function(it) {
      return eq('--replace "o({{}})" "#zz" test/data/b.js', 'debugger;\nfunction foobar(o) {\n  while (o) {\n    return o(zz) + o(zz);\n  }\n}\n', it);
    });
    test('single line multiple to multiple lines', function(it) {
      return eq('--replace "o({\n      a: {{{}}: 1}\n    })" "#zz" test/data/b.js', 'debugger;\nfunction foobar(o) {\n  while (o) {\n    return o({\n      a: {zz: 1}\n    }) + o({\n      a: {zz: 1}\n    });\n  }\n}\n', it);
    });
    return test('multiple lines', function(it) {
      return eq('--replace "var f = {{}}" func test/data/b.js', 'debugger;\nvar f = function foobar(o) {\n  while (o) {\n    return zz + zz;\n  }\n}\n', it);
    });
  });

  suite('sub match replacement', function() {
    test('prop', function(it) {
      return eq('--replace "function moo(oooo) {{.body}}" "func" test/data/b.js', 'debugger;\nfunction moo(oooo) {\n  while (o) {\n    return zz + zz;\n  }\n}\n', it);
    });
    test('child', function(it) {
      return eq('--replace "function moo(oooo) {{block}}" "func" test/data/b.js', 'debugger;\nfunction moo(oooo) {\n  while (o) {\n    return zz + zz;\n  }\n}\n', it);
    });
    test('operator', function(it) {
      return eq("--replace 'x {{.op}} y' 'bi' test/data/b.js", 'debugger;\nfunction foobar(o) {\n  while (o) {\n    return x + y;\n  }\n}\n', it);
    });
    test('more complex', function(it) {
      const replacement = '{\n  if ({{while.test}} == 9) {\n    return 2 {{bi.op}} 3;\n  }\n}';
      return eq("--replace '" + replacement + "' 'func.body' test/data/b.js", 'debugger;\nfunction foobar(o) {\n  if (o == 9) {\n    return 2 + 3;\n  }\n}\n', it);
    });
    test('even more complex', function(it) {
      const replacement = '{\n  f({{while[test=#o] return ident}} == {{bi[op=+] ident}});\n}';
      return eq("--replace '" + replacement + "' 'func.body' test/data/b.js", 'debugger;\nfunction foobar(o) {\n  f(zz == zz);\n}\n', it);
    });
    test('implied root node with spaced |', function(it) {
      return eq('ident --replace "{{ | uppercase}}"', 'var FOO = BAR;', it, {
        input: 'var foo = bar;'
      });
    });
    test('implied root node with non-spaced |', function(it) {
      return eq('ident --replace "{{| uppercase}}"', 'var FOO = BAR;', it, {
        input: 'var foo = bar;'
      });
    });
    test('overlapping', function(it) {
      return eq('bi --replace "{{.l}}-{{.r}}"', 'f(1 + 2-3);', it, {
        input: 'f(1 + 2 + 3);'
      });
    });
    test('no sub result', function(it) {
      return eq('--replace "lala({{FAKE}});" "func" test/data/b.js', 'debugger;\nlala();\n', it);
    });
    test('equery', function(it) {
      return eq('--equery --replace "return o({{__ + __}});" "return __;" test/data/b.js', 'debugger;\nfunction foobar(o) {\n  while (o) {\n    return o(zz + zz);\n  }\n}\n', it);
    });
    return test('equery with {} in replacement', function(it) {
      return eq('--equery --replace "f({{__ && {} }})" "__ && __"', 'var a = f(b && {});', it, {
        input: 'var a = b && {};'
      });
    });
  });

  suite('filters', function() {
    const objInput = 'var obj = {\n  a: 1,\n  b: 2,\n  c: 3\n};';
    const arrInput = '[1,2,3,4]';
    const strInput = 'var s = "Hi";';

    test('args escaped single quote', function(it) {
      return eq('arr --replace "[\'{{ num | join \'\\\', \\\'\'}}\']" ', "['1', '2', '3', '4']", it, {
        input: arrInput
      });
    });
    test('args escaped double quote', function(it) {
      return eq('arr --replace \'["{{ num | join "\\", \\""}}"]\' ', '["1", "2", "3", "4"]', it, {
        input: arrInput
      });
    });
    test('join', function(it) {
      const result = 'var obj = {\n  a: 1,\n  b: 2,\n  c: 3,\n  d: 4\n};';
      return eq('obj --replace "{\n  {{.props | join \',\n  \' }},\n  d: 4\n}"', result, it, {
        input: objInput
      });
    });
    test('join no arg', function(it) {
      return eq('arr --replace "[{{ num | join }}]"', '[1234]', it, {
        input: arrInput
      });
    });
    test('join before other filters', function(it) {
      return eq('arr --replace "[{{ num | join \', \' | tail }}]"', '[2, 3, 4]', it, {
        input: arrInput
      });
    });
    test('prepend', function(it) {
      return eq('arr --replace "[{{ num | prepend 0 | join \', \' }}]"', '[0, 1, 2, 3, 4]', it, {
        input: arrInput
      });
    });
    test('prepend multiple args', function(it) {
      return eq('arr --replace "[{{ num | prepend 0, -1 | join \', \' }}]"', '[-1, 0, 1, 2, 3, 4]', it, {
        input: arrInput
      });
    });
    test('append', function(it) {
      return eq('arr --replace "[{{ num | append 5 | join \', \' }}]"', '[1, 2, 3, 4, 5]', it, {
        input: arrInput
      });
    });
    test('append multiple args', function(it) {
      return eq('arr --replace "[{{ num | append 5, 6 | join \', \' }}]"', '[1, 2, 3, 4, 5, 6]', it, {
        input: arrInput
      });
    });
    test('before', function(it) {
      return eq('arr --replace "[{{ num | join \', \' | before \'0, \' }}]"', '[0, 1, 2, 3, 4]', it, {
        input: arrInput
      });
    });
    test('before multiple times', function(it) {
      return eq('arr --replace "[{{ num | join \', \' | before \'0, \' | before \'-1, \'}}]"', '[-1, 0, 1, 2, 3, 4]', it, {
        input: arrInput
      });
    });
    test('after', function(it) {
      return eq('arr --replace "[{{ num | join \', \' | after \', 5\' }}]"', '[1, 2, 3, 4, 5]', it, {
        input: arrInput
      });
    });
    test('after multiple times', function(it) {
      return eq('arr --replace "[{{ num | join \', \' | after \', 5\' | after \', 6\'}}]"', '[1, 2, 3, 4, 5, 6]', it, {
        input: arrInput
      });
    });
    test('wrap one arg', function(it) {
      return eq('arr --replace "[{{ num | join \', \' | wrap \'\\\'\' }}]"', "['1, 2, 3, 4']", it, {
        input: arrInput
      });
    });
    test('wrap two args', function(it) {
      return eq('arr --replace "[{{ num | join \', \' | wrap \'[\', \']\' }}]"', '[[1, 2, 3, 4]]', it, {
        input: arrInput
      });
    });
    test('nth', function(it) {
      return eq('arr --replace "[{{ num | nth 1 }}]"', '[2]', it, {
        input: arrInput
      });
    });
    test('nth-last', function(it) {
      return eq('arr --replace "[{{ num | nth-last 1 }}]"', '[3]', it, {
        input: arrInput
      });
    });
    test('first', function(it) {
      return eq('arr --replace "[{{ num | first }}]"', '[1]', it, {
        input: arrInput
      });
    });
    test('head', function(it) {
      return eq('arr --replace "[{{ num | head }}]"', '[1]', it, {
        input: arrInput
      });
    });
    test('tail', function(it) {
      return eq('arr --replace "[{{ num | tail }}]"', '[2]', it, {
        input: arrInput
      });
    });
    test('last', function(it) {
      return eq('arr --replace "[{{ num | last }}]"', '[4]', it, {
        input: arrInput
      });
    });
    test('initial', function(it) {
      return eq('arr --replace "[{{ num | initial | join \', \' }}]"', '[1, 2, 3]', it, {
        input: arrInput
      });
    });
    test('tail join', function(it) {
      return eq('arr --replace "[{{ num | tail | join \', \' }}]"', '[2, 3, 4]', it, {
        input: arrInput
      });
    });
    test('initial join', function(it) {
      return eq('arr --replace "[{{ num | initial | join \', \' }}]"', '[1, 2, 3]', it, {
        input: arrInput
      });
    });
    test('slice', function(it) {
      return eq('arr --replace "[{{ num | slice 1, 3 | join \', \' }}]"', '[2, 3]', it, {
        input: arrInput
      });
    });
    test('reverse', function(it) {
      return eq('arr --replace "[{{ num | reverse | join \', \' }}]"', '[4, 3, 2, 1]', it, {
        input: arrInput
      });
    });
    test('replace', function(it) {
      return eq('str --replace \'{{ :root | replace /"([^"]*)"/g, "$1 + 1" }}\' ', "var s = Hi + 1;", it, {
        input: strInput
      });
    });
    test('replace more', function(it) {
      return eq('str --replace \'{{ :root | replace /"([^"]*)"/g, "$1 + 1" | replace /1/, "there"}}\' ', "var s = Hi + there;", it, {
        input: strInput
      });
    });
    test('lowercase', function(it) {
      return eq('str --replace \'{{ :root | lowercase }}\' ', 'var s = "hi";', it, {
        input: strInput
      });
    });
    test('uppercase', function(it) {
      return eq('str --replace \'{{ :root | uppercase }}\' ', 'var s = "HI";', it, {
        input: strInput
      });
    });
    test('capitalize', function(it) {
      return eq('ident --replace \'{{ :root | capitalize }}\' ', 'Foo + Bar;', it, {
        input: 'foo + bar;'
      });
    });
    test('capitalize', function(it) {
      return eq('ident --replace \'{{ :root | uncapitalize }}\' ', 'foo + bar;', it, {
        input: 'Foo + Bar;'
      });
    });
    test('camelize', function(it) {
      return eq('ident --replace \'{{ :root | camelize }}\' ', 'fooBar;', it, {
        input: 'foo_bar;'
      });
    });
    test('str', function(it) {
      return eq('str --replace \'{{ :root | dasherize }}\' ', 'var s = "foo-bar";', it, {
        input: 'var s = "fooBar";'
      });
    });
    test('trim', function(it) {
      return eq('str --replace \'{{ :root | replace /"/g, " " | trim }}\' ', 'var s = Hi;', it, {
        input: strInput
      });
    });
    test('substring', function(it) {
      return eq('str --replace \'{{ :root | substring 1, 3 }}\' ', 'var s = Hi;', it, {
        input: strInput
      });
    });
    test('substr', function(it) {
      return eq('str --replace \'{{ :root | substr 1, 2 }}\' ', 'var s = Hi;', it, {
        input: strInput
      });
    });
    test('str-slice', function(it) {
      return eq('str --replace \'{{ :root | str-slice 1, -1 }}\' ', 'var s = Hi;', it, {
        input: strInput
      });
    });
    test('each before', function(it) {
      return eq('arr --replace "[{{ num | each before, 1 | join \', \' }}]"', '[11, 12, 13, 14]', it, {
        input: arrInput
      });
    });
    test('each before multiple times', function(it) {
      return eq('arr --replace "[{{ num | each before, 1 | each before, 0 | join \', \' }}]"', '[011, 012, 013, 014]', it, {
        input: arrInput
      });
    });
    test('each after', function(it) {
      return eq('arr --replace "[{{ num | each after, 0 | join \', \' }}]"', '[10, 20, 30, 40]', it, {
        input: arrInput
      });
    });
    test('each after multiple times', function(it) {
      return eq('arr --replace "[{{ num | each after, 0 | each after, 0 | join \', \' }}]"', '[100, 200, 300, 400]', it, {
        input: arrInput
      });
    });
    test('each wrap one arg', function(it) {
      return eq('arr --replace \'[{{ num | each wrap, "\\"" | join ", " }}]\' ', '["1", "2", "3", "4"]', it, {
        input: arrInput
      });
    });
    test('each wrap two args', function(it) {
      return eq('arr --replace \'[{{ num | each wrap, "(", ")" | join ", " }}]\' ', '[(1), (2), (3), (4)]', it, {
        input: arrInput
      });
    });
    test('each wrap multiple times', function(it) {
      return eq('arr --replace \'[{{ num | each wrap, "(", ")" | each wrap, "[", "]" | join ", " }}]\' ', '[[(1)], [(2)], [(3)], [(4)]]', it, {
        input: arrInput
      });
    });
    test('each not enough args', function(it) {
      return eq('arr --replace "[{{ num | each before | join \', \' }}]"', {
        funcType: 'error',
        value: /No arguments supplied for 'each before'/
      }, it, {
        input: arrInput
      });
    });
    test('invalid each', function(it) {
      return eq('arr --replace "[{{ num | each FAKE, 0 }}]"', {
        funcType: 'error',
        value: /'FAKE' is not supported by 'each'/
      }, it, {
        input: arrInput
      });
    });
    test('invalid filter', function(it) {
      return eq('arr --replace "[{{ num | FAKE }}]"', {
        funcType: 'error',
        value: /Invalid filter: FAKE/
      }, it, {
        input: arrInput
      });
    });
    test('invalid filter with arg', function(it) {
      return eq('arr --replace "[{{ num | FAKE arg }}]"', {
        funcType: 'error',
        value: /Invalid filter: FAKE arg/
      }, it, {
        input: arrInput
      });
    });
    test('no arg supplied', function(it) {
      return eq('arr --replace "[{{ num | nth }}]"', {
        funcType: 'error',
        value: /No arguments supplied for 'nth' filter/
      }, it, {
        input: arrInput
      });
    });
    test('two args required', function(it) {
      return eq('arr --replace "{{ :root | replace // }}"', {
        funcType: 'error',
        value: /Error during replacement.*Must supply at least two arguments for 'replace' filter/
      }, it, {
        input: arrInput
      });
    });
    test('squery non-spaced |', function(it) {
      return eq('arr --replace "{{ [op=|] }}"', 'x | y', it, {
        input: '[x | y]'
      });
    });
    test('squery spaced |', function(it) {
      return eq('arr --replace "{{ [op= | ] }}"', 'x | y', it, {
        input: '[x | y]'
      });
    });
    test('equery', function(it) {
      return eq('"f(__)" --equery --replace "[{{ x|y }}]"', '[x | y]', it, {
        input: 'f(x | y)'
      });
    });
    test('equery filter fail', function(it) {
      return eq('"f(__)" --equery --replace "[{{ g( x | y ) }}]"', '[g(x|y)]', it, {
        input: 'f(g(x|y))'
      });
    });
    return test('extra bit to args-str', function(it) {
      return eq('arr --replace "[{{ num | after || }}2]"', '[1||2]', it, {
        input: '[1]'
      });
    });
  });

  suite('named wildcards', function() {
    test('simple', function(it) {
      return eq('--equery --replace "{{b}} + {{a}}" "$a + $b"', 'x + y;', it, {
        input: 'y + x;'
      });
    });
    test('more complex', function(it) {
      return eq('--equery --replace "f({{b}}, true, {{b}}, {{a}})" "f($a, $b)"', 'f(x, true, x, y);', it, {
        input: 'f(y, x);'
      });
    });
    test('with filter', function(it) {
      return eq('--equery --replace "{{ num | wrap \' }}" "__ * $num"', "'2';", it, {
        input: 'x * 2;'
      });
    });
    test('array', function(it) {
      return eq('--equery --replace "f({{args | reverse | join \', \'}})" "f(_$args)"', 'f(x, y);', it, {
        input: 'f(y, x);'
      });
    });
    return test('object', function(it) {
      return eq('--equery --replace "{ {{props | reverse | join \', \'}} }" "({_:$props})"', '({ y:2, x: 1 });', it, {
        input: '({x: 1, y:2});'
      });
    });
  });

  return suite('write to', function() {
    const replacedContent1 = 'debugger;\nfunction foobar(o) {\n  while (o) {\n    return XX + XX;\n  }\n}\n';
    const replacedContent2 = 'function square(x) {\n  return x * x;\n}\nvar y = function(XX) {\n  f.p(XX);\n  XX++;\n  var obj = {\n    a: 1,\n    b: 2,\n    c: 3\n  };\n}\n';

    test('object', function(it) {
      return eq('--replace XX --to "{test/data/b.js: test/data/TMP.js}" "#zz" test/data/b.js', [], it, {
        final: function(content) {
          const path = './test/data/TMP.js';
          content = fs.readFileSync(path, 'utf8');
          fs.unlinkSync(path);
          return equal(content, replacedContent1);
        }
      });
    });
    test('object with callback', function(it) {
      return eq('--replace XX --to "{test/data/b.js: -}" "#zz" test/data/b.js', [replacedContent1], it, {
        final: function(content) {
          return equal(content['test/data/b.js'], replacedContent1);
        }
      });
    });
    test('only write those input files which are present in the --to obj', function(it) {
      return eq('--replace XX --to "{test/data/b.js: test/data/TMP.js}" "#/^z/" test/data/a.js test/data/b.js', [], it, {
        final: function(content) {
          const path = './test/data/TMP.js';
          content = fs.readFileSync(path, 'utf8');
          fs.unlinkSync(path);
          return equal(content, replacedContent1);
        }
      });
    });
    test('string no special', function(it) {
      return eq('--replace XX --to "test/data/TMP.js" "#zz" test/data/b.js', [], it, {
        final: function(content) {
          const path = './test/data/TMP.js';
          content = fs.readFileSync(path, 'utf8');
          fs.unlinkSync(path);
          return equal(content, replacedContent1);
        }
      });
    });
    test('string with special', function(it) {
      return eq('--replace XX --to "test/data/dir/%TMP.js" "#zz" test/data/b.js', [], it, {
        final: function(content) {
          const path = './test/data/dir/bTMP.js';
          content = fs.readFileSync(path, 'utf8');
          fs.unlinkSync(path);
          return equal(content, replacedContent1);
        }
      });
    });
    test('string with special, multiple files', function(it) {
      return eq('--replace XX --to "test/data/dir/%TMP.js" "#/^z/" test/data/b.js test/data/a.js', [], it, {
        final: function(content) {
          const path1 = './test/data/dir/bTMP.js';
          const path2 = './test/data/dir/aTMP.js';
          const content1 = fs.readFileSync(path1, 'utf8');
          const content2 = fs.readFileSync(path2, 'utf8');
          fs.unlinkSync(path1);
          fs.unlinkSync(path2);
          equal(content1, replacedContent1);
          return equal(content2, replacedContent2);
        }
      });
    });
    test('in-place', function(it) {
      const path = './test/data/b.js';
      const orig = fs.readFileSync(path, 'utf8');
      return eq('--replace XX --in-place "#/^z/" test/data/b.js', [], it, {
        final: function(content) {
          content = fs.readFileSync(path, 'utf8');
          fs.writeFileSync(path, orig);
          return equal(content, replacedContent1);
        }
      });
    });
    return test('in-place, multiple files', function(it) {
      const path1 = './test/data/b.js';
      const path2 = './test/data/a.js';
      const orig1 = fs.readFileSync(path1, 'utf8');
      const orig2 = fs.readFileSync(path2, 'utf8');
      return eq('--replace XX --in-place "#/^z/" test/data/a.js test/data/b.js', [], it, {
        final: function(content) {
          const content1 = fs.readFileSync(path1, 'utf8');
          const content2 = fs.readFileSync(path2, 'utf8');
          fs.writeFileSync(path1, orig1);
          fs.writeFileSync(path2, orig2);
          equal(content1, replacedContent1);
          return equal(content2, replacedContent2);
        }
      });
    });
  });
});
