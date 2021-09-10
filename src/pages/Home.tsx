import React, {ReactElement} from "react";
import {User} from "../../Interfaces";
import { Link } from "react-router-dom";

interface Props {
    user: User
}

function Home({user}: Props): ReactElement {
    return (
        <>
            <h1 className="u-mt-m">User Management</h1>
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
                                    <Link to="/user/new" className="list__link ">Create new user</Link>
                                </li>
                                <li className="list__item ">
                                    <Link to="/user/upload" className="list__link ">Bulk upload users</Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="grid__col col-6@m">
                        <div className="card" aria-labelledby="title2" aria-describedby="text2">
                            <h2 className="u-fs-m" id="title2">
                                <Link to="/roles">Manage roles</Link>
                            </h2>
                            <p id="text2">View, create and edit roles in Blaise.</p>
                            <ul className="list list--dashed">
                                <li className="list__item ">
                                <Link to="/roles/new" className="list__link ">Create new role</Link>
                            </li>
                        </ul>
                        </div>
                    </div>
                    {/*<div className="grid__col col-4@m">*/}
                    {/*    <div className="card" aria-labelledby="title3" aria-describedby="text3">*/}
                    {/*        <h2 className="u-fs-m" id="title3">*/}
                    {/*            <a href="#0">Your data and security</a>*/}
                    {/*        </h2>*/}
                    {/*        <p id="text3">How we keep your data safe and what happens to your personal information.</p>*/}
                    {/*        <ul className="list list--dashed">*/}
                    {/*            <li className="list__item ">*/}
                    {/*                <a href="#0" className="list__link ">List item 1</a></li>*/}
                    {/*            <li className="list__item ">*/}
                    {/*                <a href="#0" className="list__link ">List item 2</a></li>*/}
                    {/*        </ul>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </div>
            </div>
        </>
    );
}

export default Home;
