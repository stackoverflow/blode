// copied from https://gist.github.com/701407

var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs");

var config = {};

var createServer = function() {
  http.createServer(function(request, response) {

    var uri = url.parse(request.url).pathname
      , filename = path.join(process.cwd(), "output", uri);
    
    path.exists(filename, function(exists) {
      if(!exists) {
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("404 Not Found\n");
        response.end();
        return;
      }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

      fs.readFile(filename, "binary", function(err, file) {
        if(err) {        
          response.writeHead(500, {"Content-Type": "text/plain"});
          response.write(err + "\n");
          response.end();
          return;
        }

        response.writeHead(200);
        response.write(file, "binary");
        response.end();
      });
    });
  }).listen(config.port);
}

var startServer = function(opts) {
  config.port = opts.port || 4000;
  createServer();
  console.log("blode server running at http://localhost:" + config.port + "/\nCTRL + C to shutdown");
};

exports.startServer = startServer;