/* eslint-disable import/prefer-default-export */

import styled from "styled-components";

export const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
  background-color: var(--color-background);
  min-height: 100vh;
`;
