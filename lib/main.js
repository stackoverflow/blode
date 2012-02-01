var md = require("node-markdown").Markdown,
    program = require("commander"),
    fs = require("fs"),
    path = require("path"),
    fsutils = require("./fsutils"),
    server = require("./server"),
    dot = require("dot");

program
  .version("0.1.2")
  .usage("[options] <file>")
  .option("-g, --gen", "generate site")
  .option("-n, --new [name]", "create the initial directory structure of a new blode site with the specified [name] or the current directory")
  .option("-s, --server [port]", "start a server at the specified port or 4000 if none supplied")
  .option("-v, --verbose", "verbose mode")
  .parse(process.argv);

dot.templateSettings.varname = "blode";

/**
 * Returns true if the file is a htm or html file (check extension).
 * @param file the file name.
 */
var isHtml = function(file) {
  var ext = path.extname(file);
  return ext === ".htm" || ext === ".html";
};

/**
 * Prints to stdout only if in verbose mode.
 */
var log = function() {
  if(program.verbose) {
    console.log.apply(null, arguments);
  }
};

/**
 * Exits the process logging arguments to console.error.
 */
var exitWithError = function() {
  console.error.apply(null, arguments);
  process.exit(-1);
};

/**
 * Create a new blode site directory structure.
 */
var newSite = function() {
  var dir = program["new"] === true ? process.cwd() : program["new"];
  fsutils.createDirStructure(dir, ["static", "layouts", "pages", "output"], log);
};

/**
 * Render a dot template and return the result as a string.
 * @param layout the layout name.
 * @param file the file name.
 * @param data the parsed content of the file (html) to be used as the main body of the template.
 */
var renderDotTemplate = function(layout, file, data) {
  var layoutPath = fsutils.findFile(path.join(process.cwd(), "layouts"), layout, ["html", "htm"]);
  if(!layoutPath) {
    exitWithError("ERROR: there's no layout named %s in the layouts dir. For file %s", layout, file);
  }
  var fname = path.basename(file, path.extname(file));
  try {
    var template = dot.template(fs.readFileSync(layoutPath, "utf-8"));
    return template({"body": data});
  } catch(err) {
    exitWithError("ERROR: problem redering file %s for layout %s: %s", file, layout, err);
  }
};

/**
 * Parse the whole site.
 */
var parseSite = function() {
  if(!path.existsSync(path.join(process.cwd(), "pages"))) {
    exitWithError("ERROR: couldn't find the pages directory, are you in a valid blode dir?");
    return;
  }
  var cwd = process.cwd();

  log("copying static files");
  fsutils.copyFiles(path.join(cwd, "static"), path.join(cwd, "output"), log);

  log("parsing markdown files");
  fsutils.eachFileRecursive(path.join(cwd, "pages"), function(fpath) {
    var simpleName = /.*\/(.+)\.md/i.exec(fpath)[1];
    var dname = path.join(cwd, "output", simpleName + ".html");

    var layout = /.*\/pages\/(.+)\/.*/.exec(fpath);

    var data = fs.readFileSync(fpath, "utf-8");
    var html = isHtml(fpath) ? data : md(data);

    if(layout) {
      var content = renderDotTemplate(layout[1], fpath, html);
      fs.writeFileSync(dname, content, "utf-8");
    } else {
      fs.writeFileSync(dname, html, "utf-8");
    }
    log("parsing %s to %s", fpath, dname);
  }, function(fpath) {
    return fpath.match(/.*\.md/i) || isHtml(fpath);
  });
};

/**
 * Run blode.
 */
var run = function() {
  if(program["new"]) {
    log("creating new site structure...");
    newSite();
  } else if(program.gen) {
    log("generating site...");
    parseSite(program.args[0]);
  } else if(program.server) {
    server.startServer(parseInt(program.server, 10));
  }
};

exports.run = run;