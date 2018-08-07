import stripComments from 'strip-json-comments';

const varRgx = /^[@$]/;
const followVar = (value, lessVars, defaults) => {
  if (varRgx.test(value)) {
    // value is a variable
    return followVar(lessVars[value] || defaults[value.replace(varRgx, '')]);
  }
  return value;
};

export default (sheet, options = {}) => {
  const { defaults = {}, resolveVariables, stripPrefix } = options;
  let lessVars = {};
  const matches = stripComments(sheet).match(/[@$](.*:[^;]*)/g) || [];

  matches.forEach(variable => {
    const definition = variable.split(/:\s*/);
    let value = definition.splice(1).join(':');
    value = value.trim().replace(/^["'](.*)["']$/, '$1');
    lessVars[definition[0].replace(/['"]+/g, '').trim()] = value;
  });

  if (resolveVariables) {
    Object.keys(lessVars).forEach(key => {
      const value = lessVars[key];
      lessVars[key] = followVar(value, lessVars, defaults);
    });
  }

  if (stripPrefix) {
    const transformKey = key => key.replace(varRgx, '');

    lessVars = Object.keys(lessVars).reduce((prev, key) => {
      prev[transformKey(key)] = lessVars[key];
      return prev;
    }, {});
  }

  return lessVars;
};
