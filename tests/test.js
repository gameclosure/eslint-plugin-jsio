var assert = require('assert');
var plugin = require('../lib');

var preprocess = plugin.processors['.js'].preprocess;

function test(description, statement, result) {
  console.log(description);
  assert(preprocess(statement)[0] === result);
}

test("basic module import",
     "import foo, bar",
     "var foo,bar;require('foo');require('bar');");
test("import single variable from module",
     "from foo import bar",
     "var bar;require('foo');");
test("import multiple variables from module",
     "from foo import bar,baz",
     "var bar,baz;require('foo');");
test("import global path",
     "import foo.bar",
     "var foo;require('foo/bar');");
test("import relative path",
     "import .foo.bar",
     "var foo;require('./foo/bar');");
test("import relative path",
     "import ..foo.bar",
     "var foo;require('../foo/bar');");
test("import relative path",
     "import ...foo.bar",
     "var foo;require('../../foo/bar');");
test("import as alternate name",
     "import .foo.bar as baz",
     "var baz;require('./foo/bar');");
test("import as alternate name",
     "import .foo.bar as bar.baz",
     "var bar;require('./foo/bar');");
test("import as alternate name",
     "import .foo.bar as bar.baz, .foo.bar as baz",
     "var bar,baz;require('./foo/bar');require('./foo/bar');");

console.log('ok!');
