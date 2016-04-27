export default sheet => {
  const lessVars = {};

  sheet.match(/@(.*:[^;]*)/g)
    .forEach(variable => {
      const definition = variable.split(/:\s*/);
      lessVars[definition[0]] = definition[1];
    });

  return lessVars;
};
