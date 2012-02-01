var path = require("path"),
    fs = require("fs");

/**
 * Create a directory structure. Accepts a log function.
 */
var createDirStructure = function(root, subdirs, log) {
  var logf = log || function() {};
  fs.stat(root, function(err, stat) {
    if(err || !stat.isDirectory()) {
      fs.mkdirSync(root);
      logf("creating root directory %s", root);
    }
    subdirs.forEach(function(f) {
      fs.mkdirSync(path.join(root, f));
      logf("creating directory %s", path.join(root, f));
    });
  });
};

/**
 * Copy all files of fromDir to toDir. Accepts a log function.
 */
var copyFiles = function(fromDir, toDir, log) {
  var logf = log || function() {};
  var files = fs.readdirSync(fromDir);
  files.forEach(function(f) {
    var fname = path.join(fromDir, f);
    var dname = path.join(toDir, f);
    var stream = fs.createReadStream(fname);
    stream.pipe(fs.createWriteStream(dname));
    stream.resume();
    logf("copying file %s to %s", fname, dname);
  });
};

/**
 * Calls callback for each file recursively in dirPath, fitering file names with filter if given.
 */
var eachFileRecursive = function(dirPath, callback, filter) {
  var files = fs.readdirSync(dirPath);
  var filterf = filter || function() {return true;};
  files.forEach(function(f) {
    var fpath = path.join(dirPath, f);
    var stat = fs.statSync(fpath);
    if(stat.isDirectory()) {
      eachFileRecursive(fpath, callback, filter);
    } else {
      if(filterf(f)) {
        callback(fpath);
      }
    }
  });
};

/**
 * Checks in the directory path for a file named name with any of the valid extensions supplied
 * returns the first file it could find.
 */
var findFile = function(dir, name, validExtensions) {
  for(var i = 0; i < validExtensions.length; i++) {
    var fullPath = path.join(dir, name + "." + validExtensions[i]);
    if(path.existsSync(fullPath))
      return fullPath;
  }
};

exports.copyFiles = copyFiles;
exports.createDirStructure = createDirStructure;
exports.eachFileRecursive = eachFileRecursive;
exports.findFile = findFile;