import React from 'react';
import styled from 'styled-components';
import Header from './Header';
import Main from './Main';
import GlobalStyle from "../GlobalStyle";

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 80px 1fr;
  padding: var(--spacing-medium);
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
