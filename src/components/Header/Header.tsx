import { Link } from "react-router-dom";
import Nav from "../Nav/Nav";
import { Wrapper, Logo } from "./Header.styled";

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
