import React from 'react';
import { Provider } from "react-redux";
import styled from 'styled-components';
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { faWalking, faBicycle, faBus, faTrain, faSubway, faTram, faShip, faMapMarkerAlt, faExclamationTriangle, faRoute, faSpinnerThird, faChevronRight, faCircle } from "@fortawesome/pro-duotone-svg-icons";
import store from "../redux/store";
import GlobalStyle from "../GlobalStyle";
import Header from './Header';
import Main from './Main';

library.add(fab, faWalking, faBicycle, faBus, faTrain, faSubway, faTram, faShip, faMapMarkerAlt, faExclamationTriangle, faRoute, faSpinnerThird, faChevronRight, faCircle);

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
  padding: var(--spacing-huge);
  background-color: var(--color-background);
  min-height: 100vh;
`;

const App = () => (
  <Provider store={store}>
    <GlobalStyle />
    <Container>
      <Header />
      <Main />
    </Container>
  </Provider>
);

export default App;
