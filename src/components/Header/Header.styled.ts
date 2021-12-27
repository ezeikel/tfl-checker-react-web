import styled from "styled-components";

export const Wrapper = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 56px;
  padding: var(--spacing-large);
`;

export const Logo = styled.section`
  font-size: 32px;
  font-weight: bold;
  font-family: var(--primary-font-family);
  a {
    color: var(--color-white);
  }
`;
