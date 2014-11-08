/**
 * Module Dependencies
 */

var read = require('fs').readFileSync;
var path = require('path');
var assert = require('assert');
var dep = require('../');

function fixture(fileName) {
  return read(path.join(__dirname, 'fixtures', fileName), 'utf8');
}

/**
 * Inputs
 */

var fix = {};
fix.js = fixture('test.js');
fix.css = fixture('test.css');
fix.cssdupes = fixture('test.dupes.css');
fix.cssdupesFontfix = fixture('test.dupes.fontfix.css');
fix.cssdupesSamedir = fixture('test.dupes.samedir.css');
fix.removecss = fixture('test.remove.css');
fix.html = fixture('test.html');

/**
 * Outputs
 */

var out = {};
out.js = fixture('test.out.js');
out.css = fixture('test.out.css');
out.removecss = fixture('test.remove.out.css');
out.html = fixture('test.out.html');

/**
 * Tests
 */

describe('file-deps', function() {


  describe('parse', function() {
    it('should parse js', function() {
      var deps = dep(fix.js, 'js');
      var order = ['cheerio', 'cheerio.js', '/cheerio', '/cheerio.js', './cheerio', './cheerio.js', './cheerio/cheerio', './cheerio/cheerio.js', 'cheeriojs/cheerio', 'cheeriojs/cheerio/index.js', 'cheeriojs/cheerio@0.10.0', 'cheeriojs/cheerio@0.10.0/index', 'cheeriojs/cheerio@0.10.0/index.js', 'this', 'that', 'a', 'b'];
      asserts(order, deps);
    })

    it('should parse stuff with "//"', function() {
      var js = '"//" + require("foo")';
      var deps = dep(js, 'js');
      assert(1 == deps.length);
      assert('foo' == deps.pop());
    })

    it('should parse css', function() {
      var deps = dep(fix.css, 'css');
      var order = ['/foo.css', '../bar.css', '../baz.css', 'crazy.css', '../bing.css', '../photo.png', '../photoB.png', 'photoC.png', '../photoC.png', 'haha.png', 'whatever.jpg'];
      asserts(order, deps)
    });

    it('should remove duplicate paths', function() {
      var deps = dep(fix.cssdupes, 'css');
      assert.deepEqual(deps, ['../z.png']);
    })

    it('should remove paths differing only in a suffixed font-fix hack', function() {
      var deps = dep(fix.cssdupesFontfix, 'css');
      assert(!~deps.indexOf('assets/digital-7_mono_italic-webfont.eot?#iefix'), 'Duplicate filepaths are removed');
    })

    it('should remove paths differing only in same-dir prefix ./<foo> vs <foo>', function(){
      var deps = dep(fix.cssdupesSamedir, 'css')
      assert.deepEqual(deps, ['z.png'])
    })
  });


  describe('rewrite', function() {
    it('should rewrite js requires', function() {
      var order = ['cheerio', 'cheerio.js', '/cheerio', '/cheerio.js', './cheerio', './cheerio.js', './cheerio/cheerio', './cheerio/cheerio.js', 'cheeriojs/cheerio', 'cheeriojs/cheerio/index.js', 'cheeriojs/cheerio@0.10.0', 'cheeriojs/cheerio@0.10.0/index', 'cheeriojs/cheerio@0.10.0/index.js', 'this', 'that', 'a', 'b'];

      var str = dep(fix.js, 'js', function(req, ext) {
        assert(req == order.shift());
        assert('js' == ext);
        return 'foo';
      });

      assert(str == out.js);
    })

    it('should rewrite js requires with "//"', function(){
      var js = '"//" + require("foo")';
      var str = dep(js, 'js', function (req, ext) {
        assert('foo' == req);
        return 'bar';
      })
      assert('"//" + require("bar")' == str)
    })

    it('should rewrite css imports and urls', function() {
      var order = ['/foo.css', '../bar.css', '../baz.css', 'crazy.css', '../bing.css', '../photo.png', '../photo.png', '../photoB.png', 'photoC.png', 'photoC.png', '../photoC.png', 'haha.png', 'whatever.jpg'];
      var str = dep(fix.css, 'css', function(req, ext) {
        assert(req == order.shift());
        assert('css' == ext);
        return 'foo';
      });

      assert(str == out.css);
    })

    it('css should remove deps if false is returned', function() {
      var str = dep(fix.removecss, 'css', function(req, ext) {
        return false;
      });

      assert(str == out.removecss);
    })

    it('should replace @imports', function() {
      var str = dep('@import "a";', 'css', function(req) {
        return 'body {}';
      });

      assert('body {}' == str.trim());
    })

    it('should replace @imports url(...)', function() {
      var str = dep('@import url("a");', 'css', function(req) {
        return 'body {}';
      })

      assert('body {}' == str.trim());
    })

    it('should replace inner sources for url(...)', function() {
      var str = dep('body { background: url("a"); }', 'css', function(req) {
        return 'b';
      })

      assert('body { background: url("b"); }' == str);
    })
  })
})

function asserts(orders, deps) {
  orders.forEach(function(order, i) {
    assert(order == deps[i], order + ' != ' + deps[i]);
  });

  assert(orders.length == deps.length, 'orders is not the same length as deps');
}
