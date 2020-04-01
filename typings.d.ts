declare namespace lessVarsToJS {
  interface Option {

    /**
     * Resolves variables when they are defined in the same file.
     *
     * @default false
     */
    resolveVariables?: boolean;

    /**
     * When `resolveVariables` is true, passes an object to use when the value cannot be resolved in the same file.
     *
     * @default {}
     */
    dictionary?: object;

    /**
     * Removes the `@` or `$` in the returned object keys.
     *
     * @default false
     */
    stripPrefix?: boolean;
  }
}

/**
 * Takes in the contents of a less file as a string and returns an object containing all the variables it found
 *
 * @param sheet - less string
 * @param option = {} - {@link lessVarsToJS.Option}
 */
declare function lessVarsToJS(sheet: string, option?: lessVarsToJS.Option): {};

export = lessVarsToJS;
