import { createGlobalStyle, keyframes } from "styled-components";
import { normalize } from "styled-normalize";

export default createGlobalStyle`
  ${normalize}

  :root {
    /*Colors */
    --color-bakerloo: #874E29;
    --color-central: #D82928;
    --color-circle: #FECC2F;
    --color-district: #17712D;
    --color-dlr: #26AFAC;
    --color-hammersmith-city: #D59AAF;
    --color-jubilee: #6B7278;
    --color-london-overground: #E46B24;
    --color-metropolitan: #731756;
    --color-northern: #000000;
    --color-piccadilly: #0026A5;
    --color-tfl-rail: #0026A5;
    --color-tram: #6FC926;
    --color-victoria: #1EA2E0;
    --color-waterloo-city: #7DCFBD;

    --color-text: #4D4D4D;
    --color-background: #00BCD4;
    --color-white: #FFFFFF;
    --color-delay-background: #FAF5E2;
    --color-delay-text: #2672AE;

    --color-green: #31CC71;
    --color-input-background: #F6F6F4;
    --color-text-grey: #AEB8C3;

    /* Spacing */
    --spacing-tiny: 4px;
    --spacing-small: 8px;
    --spacing-medium: 16px;
    --spacing-large: 32px;
    --spacing-huge: 64px;

    /* Font */
    --primary-font-family: 'omnes-pro', sans-serif;
    --secondary-font-family: 'proxima-nova', sans-serif;
    --default-font-size: 10px;
    --font-size-alpha: 1.4rem;
    --font-size-bravo: 1.6rem;
    --font-size-charlie: 1.8rem;
    --font-size-delta: 2rem;
    --font-size-echo: 2.4rem;
    --font-size-foxtrot: 3rem;
    --font-size-golf: 3.6rem;
    --font-size-hotel: 4.8rem;
    --font-size-india: 6rem;
    --font-size-juliet: 7.2rem;

    --box-shadow: 0 3px 6px rgba(0,0,0, 0.16);

    --border-radius: 4px;

    --line-height: 1.5;
  }

  * {
    box-sizing: border-box;
  }

  html {
    font-size: var(--default-font-size);
  }

  body {
    padding: 0;
    margin: 0;
    font-family: var(--secondary-font-family);
    color: var(--color-text);
    line-height: 1.5;
  }

  img {
    max-width: 100%;
  }

  a {
    text-decoration: none;
  }

  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }

  button {
    outline: none;
    appearance: none;
    -webkit-appearance: none;
    border: none;
    cursor: pointer;
  }

  hr {
    border: 0;
  }

  ::-moz-selection {
    background-color: var(--color-background);
    color: var(--color-white);
  }

  ::selection {
    background: var(--color-background);
    color: var(--color-white);
  }

  ::-webkit-input-placeholder {
    /* Chrome/Opera/Safari */
    color: var(--color-light-grey);
    /*font-weight: 300;*/
  }

  ::-moz-placeholder {
    /* Firefox 19+ */
    color: var(--color-light-grey);
    font-weight: 300;
  }

  ::-ms-input-placeholder {
    /* IE 10+ */
    color: var(--color-light-grey);
    font-weight: 300;
  }

  ::-moz-placeholder {
    /* Firefox 18- */
    color: var(--color-light-grey);
    font-weight: 300;
  }

  /* Hide fonts until webfonts have loaded to avoid FOUT */
  .wf-loading {
    visibility: hidden;
  }
`;

export const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;
