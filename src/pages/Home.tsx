import React, { ReactElement } from "react";
import { User } from "blaise-api-node-client";
import { Link } from "react-router-dom";

interface Props {
    user: User | undefined;
}

function Home({ user }: Props): ReactElement {
    return (
        <>
            <main id="main-content" className="page__main u-mt-no">
                <h1 className="u-mt-m u-mb-l">User Management</h1>
                <p>Signed in with user <em>{user?.name}</em> with role <em>{user?.role}</em>.</p>

                <div className="container u-mt-l">
                    <div className="grid grid--column@xxs@s">
                        <div className="grid__col col-6@m">
                            <div className="card" aria-labelledby="title1" aria-describedby="text1">
                                <h2 className="u-fs-m" id="title1">
                                    <Link to="/users">Manage users</Link>
                                </h2>
                                <p id="text1">View, create and edit users in Blaise.</p>
                                <ul className="list list--dashed">
                                    <li className="list__item ">
                                        <Link to="/users/new" className="list__link ">Create new user</Link>
                                    </li>
                                    <li className="list__item ">
                                        <Link to="/users/upload" className="list__link ">Bulk upload users</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="grid__col col-6@m">
                            <div className="card" aria-labelledby="title2" aria-describedby="text2">
                                <h2 className="u-fs-m" id="title2">
                                    <Link to="/roles">Manage roles</Link>
                                </h2>
                                <p id="text2">View roles in Blaise.</p>
                                <ul className="list list--dashed">
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
