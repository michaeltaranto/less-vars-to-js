import stripComments from 'strip-json-comments';

const varRgx = /^[@$]/;

const isObject = obj => typeof obj === 'object' && !!obj;

const followVar = (value, lessVars, dictionary) => {
  let replacedValue = value;
  const matches = value.match(/(?:[@$][\w-]*)/g) || [];
  // Replace each matched variable within the value
  matches.forEach(match => {
    if (lessVars[match] || dictionary[match.replace(varRgx, '')]) {
      replacedValue = value.replace(match, lessVars[match] || dictionary[match.replace(varRgx, '')]);
    }
  });
  return replacedValue;
};

export default (sheet, options = {}) => {
  const { dictionary = {}, resolveVariables = false, stripPrefix = false } = options;
  let lessVars = {};
  const matches = stripComments(sheet).match(/(?:[@$][\w-]*)\s*:\s*(?:\{.*\}|[\s\w-#@()\/"':.%,]*)/gms) || [];

  matches.forEach(variable => {
    // Get an array with first element as the name of the less variable
    const definition = variable.split(/:\s*/);

    // Reduce the remaining elements to a single string
    let value = definition.splice(1).join(':');

    // Strip any quotes
    value = value.trim().replace(/^["'](.*)["']$/, '$1');

    // Check if the value was a Map
    if (value.includes('{')) {
      // Manipulate value into serialized JSON string
      value = value.replace(/\n\s*/g, '').replace(/([@$]*[\w-]*)\s*:([\s\w-#@()\/"'.%,]*);/gms, '"$1":"$2",').replace(/,}/, '}');

      // Parse the string to JSON
      value = JSON.parse(value);
    }

    // Add variable definition to the list
    lessVars[definition[0].replace(/['"]+/g, '').trim()] = value;
  });

  if (resolveVariables) {
    Object.keys(lessVars).forEach(key => {
      const value = lessVars[key];

      // Check any nested values first
      if (isObject(value)) {
        Object.keys(value).forEach(key => {
          const nestedValue = value[key];
          value[key] = followVar(nestedValue, lessVars, dictionary);
        });
        lessVars[key] = value;
      } else {
        lessVars[key] = followVar(value, lessVars, dictionary);
      }
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
