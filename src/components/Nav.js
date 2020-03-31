import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

const Wrapper = styled.nav`
  display: flex;
  align-items: center;
`;

const NavList = styled.ul`
  display: flex;
  height: 100%;
  li {
    display: flex;
    font-size: 22px;
    font-weight: bold;
    a {
      position: relative;
      color: var(--color-white);
      overflow-x: hidden;
      &:after {
        content: "";
        display: block;
        height: 3px;
        background-color: var(--color-white);
        position: absolute;
        bottom: 0;
        left: 0;
        width: 40%;
        transition: transform 0.3s ease-in-out;
        transform: translateX(-150%);
      }
      &.active {
        &:after {
          transform: translateX(0);
        }
      }
    }
  }
  li + li {
    margin-left: var(--spacing-large);
  }
`;

const Nav = () => {
  return (
    <Wrapper>
      <NavList>
        <li>
          <NavLink to="/" exact>
            Status updates
          </NavLink>
        </li>
        <li>
          <NavLink to="/trip-planner" exact>
            Plan a journey
          </NavLink>
        </li>
      </NavList>
    </Wrapper>
  );
};

export default Nav;
