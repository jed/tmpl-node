tmpl-node.js
============

`tmpl-node` is a template module for [node.js](http://nodejs.org/), based on John Resig's approach to [micro-templating](http://ejohn.org/blog/javascript-micro-templating/). It's a lightweight way to add templating to any `node.js` app.

To start, require the library in your app:

    var tmpl = require( "./tmpl-node" );

Then, you can start creating your own templates:

    var myTemplate = tmpl.compile("My name is <%= name %>.")

This lets you render the template within a given context, like this:

    myTemplate({ name: "Jed" }) // => "My name is Jed."

You can render templates with multiple contexts, which will all be combined into one context for rendering

    myTemplate = tmpl.compile("<%= app %> is running with pid <%= process.pid %>.")
    myTemplate({ app: "This app" }, GLOBAL ) // => "This app is running with pid 1234."

You can also load templates in batch from a folder like this:

    tmpl.load("./myTemplates/")

which creates a named template for each file. So if the folder had a file named `page.html`, you could render its contents like this:

    tmpl[ "page.html" ]({ title: "Welcome!" })

Since this is probably the most useful for rendering server responses, the method `render` is added to the `ServerResponse` object, so that you can create handlers like this:

    function( req, res ) {
      res.sendHeader(200, {"Content-Type": "text/html"});	
      res.render( "page.html", req, GLOBAL );
    }

In this case, the `render` method renders the template named `page.html` with the request and GLOBAL objects combined into one context, uses `sendBody` to send it, and then calls `finish()` on the response object.

You can also add objects to the module's `defaultContexts` array, so that they're automatically added to the context whenever a template is rendered:

    tmpl.defaultContexts.push( GLOBAL )

That's about it. Send any questions or comments [here](http://twitter.com/jedschmidt).