import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Wrapper = styled.footer`
  display: flex;
  flex-direction: column;
  background-color: #4A4A4A;
  padding: 32px;
`;

const Logo = styled.section`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 64px;
  a {
    color: var(--color-white);
  }
`;

const Versions = styled.section`
  display: flex;
  flex-direction: column;
`;

const ThisVersion = styled.div`
  display: flex;
  flex-direction: column;
  color: var(--color-white);
  margin-bottom: 32px;
  span {
    &:first-of-type {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 16px;
    }
    &:last-of-type {
      font-size: 1.6rem;
    }
  }
`;

const OtherVersions = styled.div`
  display: flex;
  flex-direction: column;
  color: var(--color-white);
  margin-bottom: 128px;
  span {
    font-size: 2rem;
    font-weight: bold;
    color: #28BCD4;
    margin-bottom: 16px;
  }
  ul {
    display: flex;
    font-size: 1.6rem;
    li + li {
      margin-left: 32px;
    }
  }
`;

const Copyright = styled.section`
  display: flex;
  justify-content: space-between;
  font-size: 1.4rem;
  color: var(--color-white);
  > div {
    &:last-of-type {
      span {
        &:first-of-type {
          color: #E34F42;
        }
        &:last-of-type {
          font-weight: bold;
        }
      }
    }
  }
`;

const Footer = () => {
  return (
    <Wrapper>
      <Logo>
        <Link to="/">TfL Checker</Link>
      </Logo>
      <Versions>
        <ThisVersion>
          <span>This website was built using</span>
          <span>React</span>
        </ThisVersion>
        <OtherVersions>
          <span>I also made versions using</span>
          <ul>
            <li>Vanilla JavaScript (no framework)</li>
            <li>Angular</li>
            <li>Vue</li>
            <li>Svelte</li>
            <li>AngularJS</li>
            <li>BackboneJS</li>
          </ul>
        </OtherVersions>
      </Versions>
      <Copyright>
        <div>&copy; TfL Checker. All rights reserved.</div>
        <div>Made with <span>♡</span> in <span>South London</span></div>
      </Copyright>
    </Wrapper>
  );
};

export default Footer;
