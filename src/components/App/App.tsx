import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GlobalStyle from "../../GlobalStyle";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Main from "../Main/Main";
import { Container } from "./App.styled";
import { JourneyContextProvider } from "../../contexts/journey";
import { SuggestionsContextProvider } from "../../contexts/suggestions";

const queryClient = new QueryClient();

const App = () => (
  <>
    <QueryClientProvider client={queryClient}>
      <GlobalStyle />
      <Container>
        <BrowserRouter>
          <JourneyContextProvider>
            <SuggestionsContextProvider>
              <Header />
              <Main />
              <Footer />
            </SuggestionsContextProvider>
          </JourneyContextProvider>
        </BrowserRouter>
      </Container>
    </QueryClientProvider>
  </>
);

export default App;
