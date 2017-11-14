import lessVarsToJS from '../src';
import { expect } from 'chai';

const cases = [
  {
    should: 'should read variables that are hex values',
    input: `
      @blue: #0d3880;
      @pink: #e60278;
    `,
    output: {
      '@blue': '#0d3880',
      '@pink': '#e60278'
    }
  },
  {
    should: 'should read variables that are named colours',
    input: `
      @import (reference) 'theme';

      @blue: lightblue;
      @pink: #e60278;
    `,
    output: {
      '@blue': 'lightblue',
      '@pink': '#e60278'
    }
  },
  {
    should: 'should read variables that reference other variables',
    input: `
      @import (reference) 'theme';

      @blue: lightblue;
      @pink: @blue;
    `,
    output: {
      '@blue': 'lightblue',
      '@pink': '@blue'
    }
  },
  {
    should: 'should ignore comments',
    input: `
      // colour palette
      @blue: #0d3880;
      @pink: #e60278;
    `,
    output: {
      '@blue': '#0d3880',
      '@pink': '#e60278'
    }
  },
  {
    should: 'should ignore import statements',
    input: `
      @import (reference) 'theme';

      @blue: #0d3880;
      @pink: #e60278;
    `,
    output: {
      '@blue': '#0d3880',
      '@pink': '#e60278'
    }
  },
  {
    should: 'should ignore rules',
    input: `
      @import (reference) 'theme';

      @blue: #0d3880;

      .element {
        color: @foreground;
      }

      @pink: #e60278;
    `,
    output: {
      '@blue': '#0d3880',
      '@pink': '#e60278'
    }
  },
  {
    should: 'should ignore include variables from within',
    input: `
      @import (reference) 'theme';

      @blue: #0d3880;

      .element {
        @foreground: black;
        color: @foreground;
      }

      @pink: #e60278;
    `,
    output: {
      '@blue': '#0d3880',
      '@foreground': 'black',
      '@pink': '#e60278'
    }
  },
  {
    should: 'should not break in file with no variables',
    input: `
      @import (reference) 'theme';

      .element {
        color: black;
      }
    `,
    output: {}
  },
  {
    should: 'should trim variable names',
    input: `
      @blue : #0d3880;
    `,
    output: {
      '@blue': '#0d3880'
    }
  },
  {
    should: 'should read variables that are url',
    input: `
      @icon-url : https://xxx.com:8080/t/font;
    `,
    output: {
      '@icon-url': 'https://xxx.com:8080/t/font'
    }
  }
];

describe('Given the contents of a less file', () => {
  cases.forEach(({ should, input, output }) => {
    it(should, () => expect(lessVarsToJS(input)).to.deep.equal(output));
  });
});
