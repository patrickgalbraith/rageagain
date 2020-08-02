/**
* metaweb.js:
*
* This file implements a Metaweb.read() utility function using a <script>
* tag to generate the HTTP request and the URL callback parameter to
* route the response to a specified JavaScript function.
**/
var Metaweb = {}; // Define our namespace
Metaweb.HOST = "http://api.freebase.com"; // The Metaweb server
Metaweb.MQLREAD = "/api/service/mqlread"; // The mqlread service on that server
Metaweb.RAW = "/api/trans/raw";
Metaweb.BLURB = "/api/trans/blurb";
Metaweb.THUMB = "/api/trans/image_thumb";

// This function submits one or more MQL queries to the mqlread service.
// When the results are available, it asynchronously passes them to
// the specified callback functions. The function expects an even number
// of arguments: each pair of arguments consists of a query and a
// callback function.
Metaweb.read = function(/* q0, f0 [, q1, f1...] */) {
    // Figure out how many queries we've been passed
    if (arguments.length < 2 || arguments.length % 2 == 1)
        throw "Wrong number of arguments to Metaweb.read()";
    var nqueries = arguments.length / 2;

    // Place each query in a query envelope, and put each query envelope
    // in an outer envelope. Also, store the callbacks in an array for
    // later use.
    var envelope = {} // The outer envelope
    var callbacks = new Array(nqueries); // An array to hold callbacks
    for(var i = 0; i < nqueries; i++) { // For each query/callback pair
        var inner = {"query": arguments[i*2]}; // Make inner query envelope
        var qname = "q" + i; // Property name for the query
        envelope[qname] = inner; // Put inner envelope in outer
        callbacks[i] = arguments[i*2 + 1]; // Callback for the query
    }

    // Serialize and encode the envelope object.
    var serialized = JSON.stringify(envelope); // http://json.org/json2.js
    var encoded = encodeURIComponent(serialized); // Core JavaScript function

    // Start building the URL
    var url = Metaweb.HOST + Metaweb.MQLREAD + // Base mqlread URL
        "?queries=" + encoded; // Queries request parameter

    // Get a callback function name for this url
    var callbackName = Metaweb.makeCallbackName(url);

    // Add the callback parameter to the URL
    url += "&callback=Metaweb." + callbackName;

    // Create the script tag that will fetch the contents of the url
    var script = document.createElement("script");

    // Define the function that will be invoked by the script tag.
    // This function expects to be passed an outer response envelope.
    // It extracts query results and passes them to the corresponding callback.
    // The function throws exceptions on errors. Since it is invoked
    // asynchronously, those exceptions can't be caught, but they will
    // appear in the browser's JavaScript console as useful diagnostics.
    Metaweb[callbackName] = function(outer) {
        // Throw an exception if there was an invocation error.
        if (outer.code != "/api/status/ok") { // Should never happen
            var error = outer.messages[0];
            throw outer.status + ": " + error.code + ": " + error.message;
        }

        var errors = []; // An array of error messages to be thrown later

        // For each query, get the response envelope, test for success,
        // and pass query results to the corresponding callback function.
        // If any query (or callback) fails, save an error to throw later.
        for(var i = 0; i < nqueries; i++) {
            var qname = "q" + i; // Query property name
            var inner = outer[qname]; // Extract inner envelope
            // Check for query success or failure
            if (inner.code == "/api/status/ok") {
                try {
                    callbacks[i](inner.result); // On success, call callback
                } catch(ex) {
                    // Remember any exceptions caused by the callback
                    errors.push("Exception from callback #" + i + ": " + ex);
                }
            }
            else {
                // If it failed, add all of its error messages to errors[].
                for(var j = 0; j < inner.messages.length; j++) {
                    var error = inner.messages[j];
                    var msg = "mqlread error in query #" + i +
                        ": " + error.code + ": " + error.message;
                    errors.push(msg);
                }
            }
        }

        // Now perform some cleanup
        document.body.removeChild(script); // Remove the <script> tag
        delete Metaweb[callbackName]; // Delete this function

        // Finally, if there were any errors, raise an exception now so they
        // at least get reported in the JavaScript console.
        if (errors.length > 0) throw errors.join("\n");
    };

    // Now set the URL of the script tag and add that tag to the document.
    // This triggers the HTTP request and submits the query.
    script.src = url
    document.body.appendChild(script);
};

// This function returns a callback name that is not currently in use.
// Ideally, to support caching, the name ought to be based on the URL so the
// same URL always generates the same name. For simplicity, however, we
// just increment a counter here.
Metaweb.makeCallbackName = function(url) {
    return "_" + Metaweb.makeCallbackName.counter++;
};
Metaweb.makeCallbackName.counter = 0; // Initialize the callback name counter.

// Return a URL for fetching the content specified by id.
// This id must identify a /type/content object, or a /common/document or
// /common/image.  The returned URL is suitable for use as the value of
// the src attribute of <iframe> or <img> or the href attribute of <a>.
Metaweb.contentURL = function(id) {
    return Metaweb.HOST + Metaweb.RAW + id;
};

// Return the URL of an excerpt or "blurb" of the document specified by id.
// The maxlen argument specifies the length of the blurb. If maxlen is
// omitted, the default is 200. If the document is an HTML document, then only
// content within <p> tags is returned.  Normally all HTML tags are stripped
// from the returned blurb, making it plain text.  For long blurbs, this can
// cause paragraphs to run together. Pass true as the third argument to retain
// <p> tags (but strip all others) in the returned blurb.
Metaweb.blurbURL = function(id, maxlen, paragraphs) {
    var url = Metaweb.HOST + Metaweb.BLURB + id;     // Base url
    if (maxlen) url += '?maxlength=' + maxlen;       // Specify blurb length
    if (paragraphs) url += '&break_paragraphs=true'; // Include <p> tags
    return url;
};

// Return the URL of a scaled-down version of the image specified by id.
// The thumbnail always preserves the aspect ratio of the original image.
// Specify the maximum width and height of the image with the maxwidth and
// maxheight arguments.  The defaults for both are 75, meaning that the
// thumbnail will have one dimension equal to 75 and the other less than or
// equal to 75.
Metaweb.thumbnailURL = function(id, maxwidth, maxheight) {
    var url = Metaweb.HOST + Metaweb.THUMB + id;
    if (maxwidth) url += '?maxwidth=' + maxwidth;
    if (maxheight) url += '&maxheight=' + maxheight;
    return url;
}

// Download the /common/document or /type/content with id specified by from.
// If the argument to is a function, pass the document content, content type
// and encoding to the function.  Otherwise, if to is a DOM element or a 
// string that identifies a DOM element insert the content into that element.
// The third argument is optional. If specified, it should be the length
// of the desired excerpt to be downloaded with /api/trans/blurb.
Metaweb.download = function(from, to, maxlen) {
    // What service are we using?
    var service = maxlen ? "/api/trans/blurb" : "/api/trans/raw";

    // This is the URL we must request with a script tag.
    var url = Metaweb.HOST + service + from;

    // Obtain a unique name for the function to receive the download.
    var cb = Metaweb.makeCallbackName(url);

    // Add the JSONP callback parameter to the URL
    url += "?callback=Metaweb." + cb;

    // Add the maxlength argument for blurbs.
    if (maxlen && typeof maxlen == "number") url += "&maxlength=" + maxlen;

    // Create the script tag that will do the download for us.
    var script = document.createElement("script");

    // Define the uniquely-named function that receives the response.
    Metaweb[cb] = function(envelope) {
		// Clean up this function and the script tag.
		document.body.removeChild(script);   // Remove the <script> tag.
		delete Metaweb[cb];                  // Delete this function.

		// If there was an error, throw an error message
		if (envelope.code != "/api/status/ok") {
			var err = envelope.messages[0];
			throw "Metaweb.download: " + envelope.status + ": " + err.code + ": " + err.message;
		}
		
		// Otherwise, get the results
		var doc = envelope.result;

		// Now handle the content we've downloaded based on the type of to.
		switch(typeof to) {
		case "function":  // Pass content to a function.
			to(doc.body, doc.media_type, doc.text_encoding);
			break;
		case "string":    // Treat string as element id.
			document.getElementById(to).innerHTML = doc.body;
			break;
		case "object":    // Assume to is a DOM element.
			to.innerHTML = doc.body;
			break;
		}
    }

    // Now set the URL of the script tag and add that tag to the document.
    // This triggers the HTTP request and invokes the trans service.
    script.src = url;
    document.body.appendChild(script);
}