import stripComments from 'strip-json-comments';

const varRgx = /^[@$]/;

const CASES = {
  dash: {
    testRgx: /-/,
    split: str => str.toLowerCase().split('-'),
    join: '-'
  },
  snake: {
    testRgx: /_/,
    split: str => str.toLowerCase().split('_'),
    join: '_'
  },
  camel: {
    testRgx: /[A-Z]/,
    split: str => {
      return str.replace(/(?!^[A-Z])([A-Z]+|[0-9]+)/g, ' $1').toLowerCase().split(' ');
    },
    join: ''
  }
};

const replaceVariables = (value, lessVars, dictionary) => {
  let replacedValue = value;
  const matches = value.match(/(?:[@$][\w-.]*)/g) || [];

  // Replace each matched variable within the value
  matches.forEach(match => {
    const mapped = match.split('.');
    const replacement = mapped.length > 1 ?
      lessVars[mapped[0]][mapped[1]] :
      dictionary[match.replace(varRgx, '')] || lessVars[match];
    replacedValue = replacedValue.replace(match, replacement);
  });
  return replacedValue;
};

const applyChangeCase = (key, changeCase) => {
  let parts;
  let joinStr = CASES.camel.join; // Default for sentence case to work
  const prefix = varRgx.test(key) ? key.charAt(0) : '';

  // Find what case the key is in
  Object.keys(CASES).forEach(caseKey => {
    // Strip the prefix and split into an array of word(s)
    if (!parts && CASES[caseKey].testRgx.test(key)) {
      parts = CASES[caseKey].split(key.replace(varRgx, ''));
    }

    // Use the CASES loop to find the join string
    if (changeCase === caseKey) {
      joinStr = CASES[caseKey].join;
    }
  });
  // If parts is still empyt it was a single word
  if (!parts) {
    parts = [key.replace(varRgx, '')];
  }
  // Apply formatting based on the new case
  parts = parts.map((part, i) => {
    let rPart = part;
    if (changeCase === 'camel' || changeCase === 'sentence') {
      if (changeCase === 'sentence' || i > 0) {
        rPart = rPart.charAt(0).toUpperCase() + rPart.slice(1);
      }
    }
    return rPart;
  });
  // Put it all back together
  return prefix + parts.join(joinStr);
};

export default (sheet, options = {}) => {
  const { dictionary = {}, resolveVariables = false, stripPrefix = false, changeCase = false } = options;
  let lessVars = {};
  const matches = stripComments(sheet).match(/(?:[@$][\w-]*)\s*:\s*(?:\{.*?\}|[\s\w-#@()\/"':.%,]*)/gms) || [];

  matches.forEach(variable => {
    // Get an array with first element as the name of the less variable
    const definition = variable.split(/:\s*/);

    // Reduce the remaining elements to a single string and strip quotes
    let value = definition.splice(1).join(':').trim().replace(/^["'](.*)["']$/, '$1');

    // Check if the value was a Map
    if (value.includes('{')) {
      // Manipulate value into serialized JSON string
      value = value.replace(/\n\s*/g, '').replace(/([\w-]*)\s*:([\s\w-#@()\/"'.%,]*);/gms, '"$1":"$2",').replace(/,}/, '}');

      // Parse the string to JSON
      try {
        value = JSON.parse(value);
      } catch (error) {
        console.error('Malformed JSON Error, check the syntax in your less file', error);
      }
    }

    // Add variable definition to the list
    lessVars[definition[0].replace(/['"]+/g, '').trim()] = value;
  });

  if (resolveVariables) {
    Object.keys(lessVars).forEach(key => {
      const value = lessVars[key];
      // Check any nested values first
      if (value.constructor && value.constructor === Object) {
        Object.keys(value).forEach(key => {
          const nestedValue = value[key];
          value[key] = replaceVariables(nestedValue, lessVars, dictionary);
        });
        lessVars[key] = value;
      } else {
        lessVars[key] = replaceVariables(value, lessVars, dictionary);
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

  if (changeCase) {
    lessVars = Object.keys(lessVars).reduce((prev, key) => {
      // Change case of map keys first
      if (lessVars[key].constructor === Object) {
        lessVars[key] = Object.keys(lessVars[key]).reduce((prev2, key2) => {
          prev2[applyChangeCase(key2, changeCase)] = lessVars[key][key2];
          return prev2;
        }, {});
      }
      prev[applyChangeCase(key, changeCase)] = lessVars[key];
      return prev;
    }, {});
  }

  return lessVars;
};
