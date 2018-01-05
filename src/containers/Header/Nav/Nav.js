import React from 'react';
import { NavLink } from 'react-router-dom';

const Nav = () => {
    return (
        <nav className="nav nav row">
            <ul className="nav__links">
                <li className="link"><NavLink to="/" exact>Status</NavLink></li>
                <li className="link"><NavLink to="/planner" exact>Planner</NavLink></li>
            </ul>
        </nav>
    )
}

export default Nav;
