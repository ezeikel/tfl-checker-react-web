/* eslint-disable import/prefer-default-export */

import styled from "styled-components";

export const Lines = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-gap: 32px;
  justify-content: space-between;
  background-color: var(--color-white);
  padding: 32px;
  border-radius: 4px;
`;
