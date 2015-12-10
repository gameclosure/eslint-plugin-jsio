/**
 * @fileoverview preprocesses jsio imports
 * @author Martin Hunt
 * @copyright 2015 Martin Hunt. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

var importExpr = /^(\s*)(import\s+[^=+*"'\r\n;\/]+|from\s+[^=+"'\r\n;\/ ]+\s+import\s+[^=+"'\r\n;\/]+)(;|\/|$)/gm;

function rewriteImports(raw, p1, p2, p3) {
  if (!/\/\//.test(p1)) {
    var declarations = getDeclarations(p2);
    var vars = declarations.vars;
    var requireStatements = declarations.requireStatements;
    return p1
      + ((vars.length ? 'var ' + vars.map(function (declaration) {
        return declaration.replace(/^\.+/, '').split('.')[0];
      }).join(',') + ';' : '')
      + (requireStatements.length ? requireStatements.map(function (statement) {
        return 'require(\'' + statement + '\');';
      }).join('') : '')).replace(/;$/, '')
      + p3;
  }

  return raw;
}

function getDeclarations(importStatement) {
  var vars = [];
  var requireStatements = [];
  // from myPackage import myFunc
  // external myPackage import myFunc
  var match = importStatement.match(/^\s*(from|external)\s+([\w.\-$]+)\s+(import|grab)\s+(.*)$/);
  if (match) {
    requireStatements.push(requireify(match[2]));
    match[4].replace(/\s*([\w.\-$*]+)(?:\s+as\s+([\w.\-$]+))?/g, function(_, item, as) {
      vars.push(as || item);
    });
  }

  if (!match) {
    match = importStatement.match(/^\s*import\s+(.*)$/);
    if (match) {
      match[1].replace(/\s*([\w.\-$]+)(?:\s+as\s+([\w.\-$]+))?,?/g, function(_, fullPath, as) {
        requireStatements.push(requireify(fullPath));
        vars.push(as || fullPath);
      });
    }
  }

  return {
    requireStatements: requireStatements,
    vars: vars
  };
}

function requireify(path) {
  var match = path.match(/^(\.*)(.*)$/);
  var leadingDots = match[1];
  var remainder = match[2];
  return (leadingDots.length == 1
            ? './'
            : leadingDots.length > 1
              ? leadingDots.substring(1).split('.').join('../')
              : '')
        + remainder.replace(/\./g, '/');
}

// import processors
module.exports.processors = {
  ".js": {
    preprocess: function (text, _filename) {
      return [text.replace(importExpr, rewriteImports)];
    },
    postprocess: function (messages, _filename) {
      return messages[0];
    }
  }
};
