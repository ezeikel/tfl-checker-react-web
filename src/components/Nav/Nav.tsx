import { NavLink } from "react-router-dom";
import { Wrapper, NavList } from "./Nav.styled";

const Nav = () => {
  return (
    <Wrapper>
      <NavList>
        <li>
          <NavLink to="/">Status updates</NavLink>
        </li>
        <li>
          <NavLink to="/trip-planner">Plan a journey</NavLink>
        </li>
      </NavList>
    </Wrapper>
  );
};

export default Nav;
