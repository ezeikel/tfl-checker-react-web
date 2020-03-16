import React from 'react';
import styled from 'styled-components';
import Header from './Header';
import Main from './Main';
import GlobalStyle from "../GlobalStyle";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { faWalking, faBicycle, faBus, faTrain, faSubway, faTram, faShip, faMapMarkerAlt, faExclamationTriangle, faRoute } from "@fortawesome/pro-duotone-svg-icons";


library.add(fab, faWalking, faBicycle, faBus, faTrain, faSubway, faTram, faShip, faMapMarkerAlt, faExclamationTriangle, faRoute);

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 80px 1fr;
  padding: var(--spacing-medium);
  background-color: #ccdde8;
  min-height: 100vh;
`;

const App = () => (
  <>
    <GlobalStyle />
    <Container>
      <Header />
      <Main />
    </Container>
  </>
);

export default App;
