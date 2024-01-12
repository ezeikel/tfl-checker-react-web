import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GlobalStyle from "../../GlobalStyle";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Main from "../Main/Main";
import { Container } from "./App.styled";
import { JourneyContextProvider } from "../../contexts/journey";
import { SuggestionsContextProvider } from "../../contexts/suggestions";

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

const queryClient = new QueryClient();

const App = () => (
  <>
    <QueryClientProvider client={queryClient}>
      <GlobalStyle />
      <JourneyContextProvider>
        <SuggestionsContextProvider>
          <Container>
            <BrowserRouter>
              <Header />
              <Main />
              <Footer />
            </BrowserRouter>
          </Container>
        </SuggestionsContextProvider>
      </JourneyContextProvider>
    </QueryClientProvider>
    <Analytics />
  </>
);

export default App;
