// tmpl-node: a template module for node.js
// Jed Schmidt - 
// 
// inspired by John Resig's micro templates
// http://ejohn.org/blog/javascript-micro-templating/

var fs = require( "fs" ),
    http = require( "http" ),
    concat = Array.prototype.concat,
    slice = Array.prototype.slice,
    sys = require('sys');


exports.compile = compile;
exports.load = load;
exports.defaultContexts = [];


http.ServerResponse.prototype.render = function( name, c1, c2, etc ) {
  var args = Array.prototype.slice.call( arguments ),
      template = exports[ args.shift() ];

  this.sendBody( template.apply( null, args ) );
  this.finish();
};

function compile( str, name ) {
  var fn = new Function( "o",
    "var ret=[];with(o){ret.push('" +     
    str.replace(/[\r\t\n]/g, " ")
      .replace(/'(?=[^%]*%>)/g,"\t")
      .split("'").join("\\'")
      .split("\t").join("'")
      .replace(/<%=(.+?)%>/g, "',$1,'")
      .split("<%").join("');")
      .split("%>").join("ret.push('")
    + "');}return ret.join('');"
  );
  
  function ret() {
    var args = concat.apply( exports.defaultContexts, arguments ),
      x = -1,
      i = args.length,
      context = {},
      name,
      cur;

    if ( i < 2 )
      return fn( args[0] || context );
      
    while ( x<i )
      for ( name in ( cur = args[ ++x ] ) )
        context[ name ] = cur[ name ];
        
    return fn( context );
  };

  if ( typeof name === "string" )
    exports[ name ] = ret;
    
  return ret;
};

function load( dir, call ) {
  var foo = {};
  dir = dir.split('');
  ( dir[dir.length-1] === '/' )||( dir.push('/') );
  dir = dir.join('');
  
  fs.readdir(dir,function(err,dat){
    var x;

    (function walker(){
      x = dat.pop();
      fs.readFile(dir + x, function(e,data){
        exports[x] = compile(data.toString());
        ( ( dat.length ) && ( walker() ) ) || ( call(exports) );
      });
      return true;
    }());
  });
};