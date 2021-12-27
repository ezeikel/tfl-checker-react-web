import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
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
import store from "../../redux/store";
import GlobalStyle from "../../GlobalStyle";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Main from "../Main/Main";
import { Container } from "./App.styled";

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

const App = () => (
  <Provider store={store}>
    <GlobalStyle />
    <Container>
      <BrowserRouter>
        <Header />
        <Main />
        <Footer />
      </BrowserRouter>
    </Container>
  </Provider>
);

export default App;
