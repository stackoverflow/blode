var md = require("node-markdown").Markdown,
    program = require("commander"),
    fs = require("fs"),
    path = require("path"),
    fsutils = require("./fsutils"),
    server = require("./server"),
    dot = require("dot"),
    dotUtils = require("./dotUtils"),
    RSS = require("rss"),
    url = require("url");

program
  .version("0.1.4")
  .usage("[options]")
  .option("-g, --gen", "generate site")
  .option("-n, --new [name]", "create the initial directory structure of a new blode site with the specified [name] or the current directory")
  .option("-s, --server [port]", "start a server at the specified port or 4000 if none supplied")
  .option("-v, --verbose", "verbose mode")
  .parse(process.argv);

dot.templateSettings.varname = "blode";
dot.templateSettings.strip = false;

// config name
var CONF_NAME = "config.json";

// basic configuration
var CONFIG = {
  "port": 4000, // default server port
  "url": null, // your site url
  "rss": null // create an rss when generating the site
};

// loaded config
var localConfig = null;

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
 * Exits the process logging arguments to console.error().
 */
var exitWithError = function() {
  console.error.apply(null, arguments);
  process.exit(-1);
};

/**
 * Get the specified configuration in the order: command line -> local config -> default config.
 */
var getConf = function(name) {
  if(name === "port") {
    return parseInt(program.server, 10) || localConfig.port || CONFIG.port;
  }
  return program[name] || localConfig[name] || CONFIG[name];
};

/**
 * Load a post (html or markdown), process the template and parse it if it's a markdown file.
 * Returns an object with the data and the template defs.
 * @param fpath the full file path
 */
var loadPost = function(fpath) {
  var data = fs.readFileSync(fpath, "utf-8");
  var defs = dotUtils.findDefs(data);
  data = dot.template(data)();
  return {"data": isHtml(fpath) ? data : md(data), "defs": defs};
};

/**
 * Create a new blode site directory structure.
 */
var newSite = function() {
  var dir = program["new"] === true ? process.cwd() : program["new"];
  fsutils.createDirStructure(dir, ["static", "layouts", "pages", "output"], log);
  var fpath = path.join(dir, "config.json");
  log("creating file %s", fpath);
  fs.writeFileSync(fpath, JSON.stringify(CONFIG, null, "\t"), "utf-8");
};

/**
 * Render a dot template and return the result as a string.
 * @param layout the layout name.
 * @param file the file name.
 * @param data the parsed content of the file (html) to be used as the main body of the template.
 * @param extras additional variables passed to the template.
 */
var renderDotTemplate = function(layout, file, data, extras) {
  var layoutPath = fsutils.findFile(path.join(process.cwd(), "layouts"), layout, ["html", "htm"]);
  if(!layoutPath) {
    exitWithError("ERROR: there's no layout named %s in the layouts dir. For file %s", layout, file);
  }
  var fname = path.basename(file, path.extname(file));
  try {
    var template = dot.template(fs.readFileSync(layoutPath, "utf-8"));
    extras = extras || {};
    extras.body = data;
    return template(extras);
  } catch(err) {
    exitWithError("ERROR: problem redering file %s for layout %s: %s", file, layout, err);
  }
};

/**
 * Generate a xml RSS for the posts.
 * @param posts the array of posts.
 */
var genRSS = function(posts) {
  var feed = new RSS(getConf("rss"));
  var u = url.parse(getConf("url"));

  posts.forEach(function(post) {
    var rpost = loadPost(post.path);
    var defs = rpost.defs;

    feed.item({
      "title": defs.title || post.name,
      "description": rpost.data,
      "url": u.href + post.link,
      "date": defs.date || new Date().toString()
    });
  });
  return feed.xml();
};

/**
 * Pre-parse all posts and return the list.
 */
var preParse = function() {
  log("pre-parsing dynamic files");
  var posts = [];
  fsutils.eachFileRecursive(path.join(process.cwd(), "pages"), function(fpath) {
    var name = path.basename(fpath, path.extname(fpath));
    posts.push({
      "path": fpath,
      "link": name + ".html",
      "name": name
    });
  }, function(fpath) {
    return fpath.match(/.*\.md/i) || isHtml(fpath);
  });
  return posts;
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

  var posts = preParse();

  log("parsing markdown files");
  posts.forEach(function(post) {
    var dname = path.join(cwd, "output", post.link);

    var layout = /.*\/pages\/(.+)\/.*/.exec(post.path);

    var html = loadPost(post.path).data;

    if(layout) {
      var content = renderDotTemplate(layout[1], post.path, html, {"posts": posts});
      fs.writeFileSync(dname, content, "utf-8");
    } else {
      fs.writeFileSync(dname, html, "utf-8");
    }
    log("parsing %s to %s", post.path, dname);
  });

  if(getConf("rss")) {
    log("generating RSS");
    fs.writeFileSync(path.join(cwd, "output", "rss.xml"), genRSS(posts), "utf-8")
  }
  log("done");
};

/**
 * Run blode.
 */
var run = function() {
  var fpath = path.join(process.cwd(), CONF_NAME);
  localConfig = fsutils.loadJsonFile(fpath) || {};
  if(program["new"]) {
    log("creating new site structure...");
    newSite();
  } else if(program.gen) {
    log("generating site...");
    parseSite();
  } else if(program.server) {
    server.startServer({"port": getConf("port")});
  }
};

exports.run = run;
exports.version = program.version();