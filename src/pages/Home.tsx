import React, { ReactElement } from "react";
import { Link } from "react-router-dom";

function Home(): ReactElement {
    return (
        <>
            <main id="main-content" className="ons-page__main ons-u-mt-no">
                <h1 className="ons-u-mt-m ons-u-mb-l">Access Management</h1>

                <div className="ons-container ons-u-mt-l">
                    <div className="ons-grid ons-grid--column@xxs@s">
                        <div className="ons-grid__col ons-col-6@m">
                            <div className="ons-card" aria-labelledby="title1" aria-describedby="text1">
                                <h2 className="ons-u-fs-m" id="title1">
                                    <Link to="/users">Manage users</Link>
                                </h2>
                                <p id="text1">View, create and edit users in Blaise.</p>
                                <ul className="ons-list ons-list--dashed">
                                    <li className="ons-list__item ">
                                        <Link to="/users/new" className="ons-list__link ">Create new user</Link>
                                    </li>
                                    <li className="ons-list__item ">
                                        <Link to="/users/upload" className="ons-list__link ">Bulk upload users</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="ons-grid__col ons-col-6@m">
                            <div className="ons-card" aria-labelledby="title2" aria-describedby="text2">
                                <h2 className="ons-u-fs-m" id="title2">
                                    <Link to="/roles">Manage roles</Link>
                                </h2>
                                <p id="text2">View roles in Blaise.</p>
                                <ul className="ons-list ons-list--dashed">
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default Home;
