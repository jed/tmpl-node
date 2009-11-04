// tmpl-node: a template module for node.js
// Jed Schmidt - http://jedschmidt.com/
// 
// inspired by John Resig's micro templates
// http://ejohn.org/blog/javascript-micro-templating/

var posix = require( "posix" ),
		http = require( "http" ),
    concat = Array.prototype.concat,
    slice = Array.prototype.slice;

process.mixin( exports, {
	compile: compile,
	load: load,
	defaultContexts: []
});

http.ServerResponse.prototype.render = function( name, c1, c2, etc ) {
	var	args = Array.prototype.slice.call( arguments ),
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
      i = args.length,
      context = {},
      name,
      cur;

    if ( i < 2 )
      return fn( args[0] || context );
      
    while ( i )
      for ( name in ( cur = args[ --i ] ) )
        context[ name ] = cur[ name ];
        
    return fn( context );
  };

  if ( typeof name === "string" )
    exports[ name ] = ret;
    
  return ret;
};

function load( dir, pattern ) {
  var promise = new process.Promise();

  posix.readdir( dir ).addCallback( function( files ) {
    var count = files.length;    
    files.forEach( function( name ) {
      if ( pattern && !pattern.test( name ) )
        return --count;

      posix.cat( dir + name ).addCallback( function( contents ) {
        compile( contents, name );
        if ( !--count )
          promise.emitSuccess();
      })
    });
  });
  
  return promise;
};