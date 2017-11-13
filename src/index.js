export default sheet => {
  const lessVars = {};
  const matches = sheet.match(/@(.*:[^;]*)/g) || [];

  matches.forEach(variable => {
    const definition = variable.split(/:\s*/);
    lessVars[definition[0].replace(/['"]+/g, '').trim()] = definition.splice(1).join(':');
  });

  return lessVars;
};
