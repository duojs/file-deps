/**
 * Module dependencies
 */

var compile = require('./compile');
var re = compile(/@import\s*['"]([^'"]+)|url\(['"]?([^'"\(]+)['"]?[\,\)]/);
var tokenizer = require('mini-tokenizer');
var tokens = tokenizer(re, function(m) {
  return m[2] || m[1];  
});

/**
 * Export `css`
 */

module.exports = css;

/**
 * Initialize `css`
 *
 * @param {String} str
 * @param {String} ext
 * @param {Function} fn
 */

function css(str, ext, fn) {  
  fn = fn || function() {};

  // parse
  if (1 == arguments.length) return tokens(str);

  // rewrite
  return str.replace(re, function(m, imp, url) {
    var req = url || imp
    if (undefined == req) return m;
    var rep = fn(req, ext);
    if (!rep) return m;
    return m.replace(req, rep);
  });
}
