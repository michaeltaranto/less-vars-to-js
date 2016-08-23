export default sheet => {
  const lessVars = {};
  const matches = sheet.match(/@(.*:[^;]*)/g) || [];

  matches.forEach(variable => {
    const definition = variable.split(/:\s*/);
    lessVars[definition[0]] = definition[1];
  });

  return lessVars;
};
