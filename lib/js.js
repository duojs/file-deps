/**
 * Module dependencies
 */

var compile = require('./compile');
var re = compile(/require *\(['"]([^'"]+)['"]\)/);
var tokenizer = require('mini-tokenizer');
var tokens = tokenizer(re, '$1');

/**
 * Export `js`
 */

module.exports = js;

/**
 * Initialize `js`
 *
 * @param {String} str
 * @param {String} ext
 * @param {Function} fn
 */

function js(str, ext, fn) {  
  fn = fn || function() {};

  // parse
  if (1 == arguments.length) return tokens(str);

  // rewrite
  return str.replace(re, function(m, req) {
    if (undefined == req) return m;
    var rep = fn(req, ext);
    if (undefined === rep) return m;
    else if (!rep) return '';
    else return m.replace(req, rep);
  });
}
