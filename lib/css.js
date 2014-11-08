/**
 * Module dependencies
 */

var unique = require('lodash.uniq');
var compile = require('./compile');
var re = compile(/(?:@import[^\('"]+[\('"]{1,2}|[a-z\-: ]*url *?\(['"]?)([^\)'"]+)[ ,\)'"]+[^;,]*[;,]/);
var tokenizer = require('mini-tokenizer');
var tokens = tokenizer(re, '$1');
var fontFixRe = /(?:(?:\?|#).*)$/
var currentDirPrefixRe = /^\.\//


/**
 * Export `css`
 */

module.exports = css;

/**
 * Regexps
 */

var rurl = /(url\s*\(['"]?)([^'"\)]+)['"]?\)/;

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
  if (1 == arguments.length) return parseFilepaths(str);

  // rewrite
  return str.replace(re, function(m, req, index) {
    if (undefined == req) return m;
    var rep = fn(req, ext);
    if (undefined === rep) return m;
    else if (!rep) return '';

    return !importing(m)
      ? change(m, rep)
      : rep;
  });
}

/**
 * Check if @import match
 *
 * @param {String} str
 * @return {Boolean}
 * @api private
 */

function importing(str) {
  return !!~str.indexOf('@import');
}

/**
 * Swap out the dependency in url(...)
 *
 * @param {String} str
 * @param {String} rep
 * @return {String}
 * @api private
 */

function change(str, rep) {
  var m = str.match(rurl);
  var before = m.index + m[1].length;
  var after = before + m[2].length;

  return str.slice(0, before)
    + rep
    + str.slice(after);
}

/**
 *  Return CSS filepaths within given CSS
*/
function parseFilepaths(cssStr) {
  return unique(
    tokens(cssStr)
      .map(strip(fontFixRe))
      .map(strip(currentDirPrefixRe))
  )
}

/**
 *  Return a function `doStrip` that replaces its given
 *  value with `strip`'s given value/pattern.
*/
function strip(re) {
  return function doStrip(str) {
    return str.replace(re, '')
  }
}
