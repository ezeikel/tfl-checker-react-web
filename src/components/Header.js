import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Nav from "./Nav";

const Wrapper = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 56px;
  padding: var(--spacing-large);
`;

const Logo = styled.section`
  font-size: 32px;
  font-weight: bold;
  font-family: var(--primary-font-family);
  a {
    color: var(--color-white);
  }
`;

const Header = () => {
  return (
    <Wrapper>
      <Logo>
        <Link to="/">TfL Checker</Link>
      </Logo>
      <Nav />
    </Wrapper>
  );
};

export default Header;
