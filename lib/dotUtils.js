var dot = require("dot");

/**
 * Returns an object with all defines from this template.
 * @param template the doT template string.
 */
var findDefs = function(template) {
  var result = {};
  template.replace(dot.templateSettings.define, function(match, code, assing, value) {
    if(code.indexOf("def.") === 0) {
      code = code.substring(4);
    }
    result[code] = value.trim();
  });
  return result;
};

exports.findDefs = findDefs;