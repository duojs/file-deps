/**
 * Parsers
 */

var parsers = {};
parsers.js = require('./lib/js');
parsers.css = require('./lib/css');
parsers.html = require('./lib/html');

/**
 * Export `deps`
 */

module.exports = deps;

/**
 * Initialize `deps`
 *
 * @param {String} str
 * @param {String} ext
 * @param {Function} fn
 */

function deps(str, ext, fn) {
 return fn
   ? rewrite(str, ext, fn)
   : parse(str, ext);
};

/**
 * Parse
 */

function parse(str, ext) {
  return parsers[ext](str);
}

/**
 * Rewrite
 */

function rewrite(str, ext, fn) {
  return parsers[ext](str, ext, fn);
}
