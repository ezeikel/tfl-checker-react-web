import styled from "styled-components";

export const Wrapper = styled.footer`
  display: flex;
  flex-direction: column;
  background-color: #4a4a4a;
  padding: var(--spacing-large);
`;

export const Logo = styled.section`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 64px;
  font-family: var(--primary-font-family);
  a {
    color: var(--color-white);
  }
`;

export const Versions = styled.section`
  display: flex;
  flex-direction: column;
`;

export const ThisVersion = styled.div`
  display: flex;
  flex-direction: column;
  color: var(--color-white);
  margin-bottom: 32px;
  span {
    &:first-of-type {
      font-family: var(--primary-font-family);
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 16px;
    }
    &:last-of-type {
      font-size: 1.6rem;
    }
  }
`;

export const OtherVersions = styled.div`
  display: flex;
  flex-direction: column;
  color: var(--color-white);
  margin-bottom: 32px;
  span {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 16px;
  }
  ul {
    display: flex;
    font-size: 1.6rem;
    a {
      color: #28bcd4;
    }
    li + li {
      margin-left: 32px;
    }
  }
`;

export const Designs = styled.div`
  display: flex;
  flex-direction: column;
  color: var(--color-white);
  margin-bottom: 128px;
  span {
    font-family: var(--primary-font-family);
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 16px;
  }
  ul {
    display: flex;
    font-size: 1.6rem;
    a {
      color: #28bcd4;
    }
    li + li {
      margin-left: 32px;
    }
  }
`;

export const Copyright = styled.section`
  display: flex;
  justify-content: space-between;
  font-size: 1.4rem;
  color: var(--color-white);
  > div {
    &:last-of-type {
      span {
        &:first-of-type {
          color: #e34f42;
        }
        &:last-of-type {
          font-weight: bold;
        }
      }
    }
  }
`;
