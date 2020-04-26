import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import styled from "styled-components";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import {
  faWalking,
  faBicycle,
  faBus,
  faTrain,
  faSubway,
  faTram,
  faShip,
  faExclamationTriangle,
  faRoute,
  faSpinnerThird,
  faChevronRight,
  faCircle,
  faBusAlt,
  faArrowRight,
  faArrowLeft,
} from "@fortawesome/pro-duotone-svg-icons";
import { faMapMarkerAlt } from "@fortawesome/pro-solid-svg-icons";
import store from "../redux/store";
import GlobalStyle from "../GlobalStyle";
import Header from "./Header";
import Footer from "./Footer";
import Main from "./Main";

library.add(
  fab,
  faWalking,
  faBicycle,
  faBus,
  faBusAlt,
  faTrain,
  faSubway,
  faTram,
  faShip,
  faMapMarkerAlt,
  faExclamationTriangle,
  faRoute,
  faSpinnerThird,
  faChevronRight,
  faCircle,
  faArrowRight,
  faArrowLeft,
);

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
  background-color: var(--color-background);
  min-height: 100vh;
`;

const App = () => (
  <Provider store={store}>
    <GlobalStyle />
    <Container>
      <Router>
        <Header />
        <Main />
        <Footer />
      </Router>
    </Container>
  </Provider>
);

export default App;
