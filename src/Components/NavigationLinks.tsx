import {Link, useLocation} from "react-router-dom";
import React, {ReactElement} from "react";

export function NavigationLinks(): ReactElement {
    const {pathname} = useLocation();

    const list = [
        {
            id: "users-link",
            title: "Manage users",
            link: "/users"
        }, {
            id: "roles-link",
            title: "Manages roles",
            link: "/roles"
        },
    ];

    return (
        <div className="header__bottom">
            <div className="container container--gutterless@xxs@m">
                <nav className="header-nav js-header-nav" id="main-nav" aria-label="Main menu"
                     data-analytics="header-navigation">
                    <ul className="header-nav__list">
                        <li className={`header-nav__item  ${(pathname === "/" ? "header-nav__item--active" : "")}`}>
                            <Link to="/" id="home-link" className="header-nav__link">
                                Home
                            </Link>
                        </li>
                        {list.map(({id, title, link}) => {
                            return (
                                <li key={id}
                                    className={`header-nav__item  ${(pathname.includes(link) ? "header-nav__item--active" : "")}`}>
                                    <Link to={link} id={id} className="header-nav__link">
                                        {title}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </div>
    );
}
