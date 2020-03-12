import { createGlobalStyle } from "styled-components";

export default createGlobalStyle`
  :root {
    /*Colors */
    --bakerloo-color: #B36305;
    --central-color: #E32017;
    --circle-color: #FFD300;
    --district-color: #00782A;
    --hammersmith-city-color: #F3A9BB;
    --jubilee-color: #A0A5A9;
    --metropolitan-color: #9B0056;
    --northern-color: #000000;
    --piccadilly-color: #003688;
    --victoria-color: #0098D4;
    --waterloo-city-color: #95CDBA;

    /* Spacing */
    --spacing-tiny: 4px;
    --spacing-small: 8px;
    --spacing-medium: 16px;
    --spacing-large: 32px;
    --spacing-huge: 64px;
      
    /* Font Sizing */
    --default-font-size: 16px;
  }

  body {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: sans-serif;
  }

  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
`;