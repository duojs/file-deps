/**
 * Module dependencies
 */

var compile = require('./compile');
var re = compile(/(?:@import[^\('"]+[\('"]{1,2}|[a-z\-: ]*url *?\(['"]?)([^\)'"]+)[ ,\)'"]+[^;,]*[;,]/);
var tokenizer = require('mini-tokenizer');
var tokens = tokenizer(re, '$1');

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
  return str.replace(re, function(m, req) {
    if (undefined == req) return m;
    var rep = fn(req, ext);
    if (undefined === rep) return m;
    else if (!rep) return '';

    // replace entirely if we have an import
    // otherwise replace from inside
    return importing(m)
      ? rep
      : m.replace(req, rep);
  });
}

function importing(str) {
  // console.log(str);
  return !!~str.indexOf('@import');
}
