import lessVarsToJS from '../src';
import { expect } from 'chai';

it('should read variables that are hex values', () => expect(lessVarsToJS(`
  @blue: #0d3880;
  @pink: #e60278;
`)).to.deep.equal({
  '@blue': '#0d3880',
  '@pink': '#e60278'
}));

it('should read variables that are named colours', () => expect(lessVarsToJS(`
  @import (reference) 'theme';

  @blue: lightblue;
  @pink: #e60278;
`)).to.deep.equal({
  '@blue': 'lightblue',
  '@pink': '#e60278'
}));

it('should read variables that reference other variables', () => expect(lessVarsToJS(`
  @import (reference) 'theme';

  @blue: lightblue;
  @pink: @blue;
`)).to.deep.equal({
  '@blue': 'lightblue',
  '@pink': '@blue'
}));

it('should resolve variables that reference other variables', () => expect(lessVarsToJS(`
  @import (reference) 'theme';

  @blue: lightblue;
  @pink: @blue;
`, { resolveVariables: true })).to.deep.equal({
  '@blue': 'lightblue',
  '@pink': 'lightblue'
}));

it('should resolve variables in any position', () => expect(lessVarsToJS(`
  @blue: #0d3880;
  @dark-blue : darken(@blue, 20%);
  @angle: 215deg;
  @gradient: linear-gradient(@angle, @blue, @dark-blue);
`, { resolveVariables: true })).to.deep.equal({
  '@blue': '#0d3880',
  '@dark-blue': 'darken(#0d3880, 20%)',
  '@angle': '215deg',
  '@gradient': 'linear-gradient(215deg, #0d3880, darken(#0d3880, 20%))'
}));

it('should ignore comments', () => expect(lessVarsToJS(`
  // colour palette
  @blue: #0d3880;
  @pink: #e60278;
`)).to.deep.equal({
  '@blue': '#0d3880',
  '@pink': '#e60278'
}));

it('should ignore variables in comments', () => expect(lessVarsToJS(`
  @blue: #0d3880; // Comment @blue: blue
  // @blue: blue;
  /* @blue: blue; */
`)).to.deep.equal({
  '@blue': '#0d3880'
}));

it('should ignore import statements', () => expect(lessVarsToJS(`
  @import (reference) 'theme';

  @blue: #0d3880;
  @pink: #e60278;
`)).to.deep.equal({
  '@blue': '#0d3880',
  '@pink': '#e60278'
}));

it('should ignore rules', () => expect(lessVarsToJS(`
  @import (reference) 'theme';

  @blue: #0d3880;

  .element {
    color: @foreground;
  }

  @pink: #e60278;
`)).to.deep.equal({
  '@blue': '#0d3880',
  '@pink': '#e60278'
}));

it('should ignore include variables from within', () => expect(lessVarsToJS(`
  @import (reference) 'theme';

  @blue: #0d3880;

  .element {
    @foreground: black;
    color: @foreground;
  }

  @pink: #e60278;
`)).to.deep.equal({
  '@blue': '#0d3880',
  '@foreground': 'black',
  '@pink': '#e60278'
}));

it('should not break in file with no variables', () => expect(lessVarsToJS(`
  @import (reference) 'theme';

  .element {
    color: black;
  }
`)).to.deep.equal({}));

it('should not break in empty file', () => expect(lessVarsToJS('')).to.deep.equal({}));

it('should trim variable names', () => expect(lessVarsToJS(`
    @blue : #0d3880;
`)).to.deep.equal({
  '@blue': '#0d3880'
}));

it('should trim values', () => expect(lessVarsToJS(`
  @blue :   #0d3880  ;
`)).to.deep.equal({
  '@blue': '#0d3880'
}));

it('should read variables that are url', () => expect(lessVarsToJS(`
  @icon-url : "https://xxx.com:8080/t/font";
`)).to.deep.equal({
  '@icon-url': 'https://xxx.com:8080/t/font'
}));

it('should remove the @ when stripPrefix is true', () => expect(lessVarsToJS(`
  @blue : #0d3880;
  @primary: @orange;
`, { stripPrefix: true })).to.deep.equal({
  'blue': '#0d3880',
  'primary': '@orange'
}));

it('should use dictionary variable values', () => expect(lessVarsToJS(`
  @color : @blue;
`, { resolveVariables: true, dictionary: { 'blue': '#0000FF' } })).to.deep.equal({
  '@color': '#0000FF'
}));

it('should prefer dictionary over less variables', () => expect(lessVarsToJS(`
  @blue  : #4176A7;
  @color : @blue;
`, { resolveVariables: true, dictionary: { 'blue': '#0000FF' } })).to.deep.equal({
  '@blue': '#4176A7',
  '@color': '#0000FF'
}));

it('should not parse functions', () => expect(lessVarsToJS(`
  @color : darken(@blue, 20%);
`)).to.deep.equal({
  '@color': 'darken(@blue, 20%)'
}));

it('should support sass variables', () => expect(lessVarsToJS(`
  $font-stack:    Helvetica, sans-serif;
  $primary-color: #333;
`)).to.deep.equal({
  '$font-stack': 'Helvetica, sans-serif',
  '$primary-color': '#333'
}));

it('should support sass variables with stripPrefix', () => expect(lessVarsToJS(`
  $font-stack:    Helvetica, sans-serif;
  $primary-color: #333;
`, { stripPrefix: true })).to.deep.equal({
  'font-stack': 'Helvetica, sans-serif',
  'primary-color': '#333'
}));

it('should camelCase keys', () => expect(lessVarsToJS(`
  @dark-red: #660000;
  @darkBlue: #000066;
  @dark_green: #006600;
  @DarkOrange: #664400;
  @purple: #990099;
`, { changeCase: 'camel', stripPrefix: true })).to.deep.equal({
  'darkRed': '#660000',
  'darkBlue': '#000066',
  'darkGreen': '#006600',
  'darkOrange': '#664400',
  'purple': '#990099'
}));

it('should dash-case keys', () => expect(lessVarsToJS(`
  @dark-red: #660000;
  @darkBlue: #000066;
  @dark_green: #006600;
  @DarkOrange: #664400;
  @purple: #990099;
`, { changeCase: 'dash', stripPrefix: true })).to.deep.equal({
  'dark-red': '#660000',
  'dark-blue': '#000066',
  'dark-green': '#006600',
  'dark-orange': '#664400',
  'purple': '#990099'
}));

it('should snake_case keys', () => expect(lessVarsToJS(`
  @dark-red: #660000;
  @darkBlue: #000066;
  @dark_green: #006600;
  @DarkOrange: #664400;
  @purple: #990099;
`, { changeCase: 'snake', stripPrefix: true })).to.deep.equal({
  'dark_red': '#660000',
  'dark_blue': '#000066',
  'dark_green': '#006600',
  'dark_orange': '#664400',
  'purple': '#990099'
}));

it('should SentenceCase keys', () => expect(lessVarsToJS(`
  @dark-red: #660000;
  @darkBlue: #000066;
  @dark_green: #006600;
  @DarkOrange: #664400;
  @purple: #990099;
`, { changeCase: 'sentence', stripPrefix: true })).to.deep.equal({
  'DarkRed': '#660000',
  'DarkBlue': '#000066',
  'DarkGreen': '#006600',
  'DarkOrange': '#664400',
  'Purple': '#990099'
}));

it('should change the case of keys with prefixes', () => expect(lessVarsToJS(`
  @dark-red: #660000;
  @darkBlue: #000066;
  @dark_green: #006600;
  @DarkOrange: #664400;
  @purple: #990099;
`, { changeCase: 'camel' })).to.deep.equal({
  '@darkRed': '#660000',
  '@darkBlue': '#000066',
  '@darkGreen': '#006600',
  '@darkOrange': '#664400',
  '@purple': '#990099'
}));

it('should change the case of keys with numbers', () => expect(lessVarsToJS(`
  @dark-red-1: #660000;
  @dark_red_2: #660000;
  @darkRed3: #660000;
  @DarkRed4: #660000;
`, { changeCase: 'snake' })).to.deep.equal({
  '@dark_red_1': '#660000',
  '@dark_red_2': '#660000',
  '@dark_red_3': '#660000',
  '@dark_red_4': '#660000'
}));

it('should change the case of keys in maps', () => expect(lessVarsToJS(`
  @colors: {
    dark-red: #660000;
    darkBlue: #000066;
  }
  @other-colors: {
    dark_green: #006600;
    DarkOrange: #664400;
    purple: #990099;
  }
`, { changeCase: 'camel' })).to.deep.equal({
  '@colors': {
    'darkRed': '#660000',
    'darkBlue': '#000066'
  },
  '@otherColors': {
    'darkGreen': '#006600',
    'darkOrange': '#664400',
    'purple': '#990099'
  }
}));

it('should support maps', () => expect(lessVarsToJS(`
  @colors: {
    flat-blue : #4176A7;
    dark-blue : darken(#4176A7, 20%);
    font-stack: Helvetica, sans-serif;
  }
`)).to.deep.equal({
  '@colors': {
    'flat-blue': '#4176A7',
    'dark-blue': 'darken(#4176A7, 20%)',
    'font-stack': 'Helvetica, sans-serif'
  }
}));

it('should handle empty maps', () => expect(lessVarsToJS(`
  @colors: {
  }
`)).to.deep.equal({
  '@colors': {}
}));

it('should resolve variables in maps', () => expect(lessVarsToJS(`
  @blue: #4176A7;
  @colors: {
    primary: @blue;
    dark-blue: darken(@blue, 20%);
  }
`, { resolveVariables: true })).to.deep.equal({
  '@blue': '#4176A7',
  '@colors': {
    'primary': '#4176A7',
    'dark-blue': 'darken(#4176A7, 20%)'
  }
}));

it('should resolve mapped variables', () => expect(lessVarsToJS(`
  @colors: {
    flat-blue: #4176A7;
    dark-red : #9A1D0D;
  };
  @button-color: @colors.flat-blue;
`, { resolveVariables: true })).to.deep.equal({
  '@colors': {
    'flat-blue': '#4176A7',
    'dark-red': '#9A1D0D'
  },
  '@button-color': '#4176A7'
}));

it('should handle all possibilities at once', () => expect(lessVarsToJS(`
  @blue: #4176A7;
  @button-color: @blue;
  @colors: {
    primary: @red;
    dark-blue: darken(@blue, 20%);
  }
  @moreColors: {
    white: #FFFFFF;
    dark-gray: #444444;
  }
`, { resolveVariables: true, dictionary: { 'red': '#FF0000', 'orange': '#AACC00' }, stripPrefix: true, changeCase: 'snake' })).to.deep.equal({
  'blue': '#4176A7',
  'button_color': '#4176A7',
  'colors': {
    'primary': '#FF0000',
    'dark_blue': 'darken(#4176A7, 20%)'
  },
  'more_colors': {
    'white': '#FFFFFF',
    'dark_gray': '#444444'
  }
}));

it('should catch malformed less maps', () => expect(lessVarsToJS(`
  @colors: {
    red: #FF0000,
    blue: #0000FF;
  }
`, { resolveVariables: true })).to.deep.equal({
  '@colors': '{red:#FF0000,"blue":"#0000FF"}'
}));
