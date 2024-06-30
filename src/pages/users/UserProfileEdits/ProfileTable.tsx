import React from "react";
import { User } from "blaise-api-node-client";
import { Link } from "react-router-dom";
import { GetUserResponse } from "../../../Interfaces/usersPage";

export default function ProfileTable({ currentUser, viewedUserDetails }: {currentUser: User, viewedUserDetails: GetUserResponse}) {
    const { name = "", role = "", defaultServerPark = "", serverParks = [] } = viewedUserDetails?.data ?? {};
    const { name: currentUsername } = currentUser;

    return (
        <main id="main-content" className="ons-page__main ons-u-mt-no">
            <div className="ons-summary">
                <div id="personal-details" className="ons-summary__group">
                    <h2 className="ons-summary__group-title">User profile</h2>
                    <dl className="ons-summary__items">
                        <div id="name-row" className="ons-summary__item">
                            <div className="ons-summary__row ons-summary__row--has-values" id="name">
                                <dt className="ons-summary__item-title">
                                    <div className="ons-summary__item--text">Name</div>
                                </dt>
                                <dd className="ons-summary__values">
                                    <span className="ons-summary__text">{name ? name : "Not found"}</span>
                                </dd>
                                <dd className="ons-summary__actions">
                                </dd>
                            </div>
                        </div>
                        <div id="password-row" className="ons-summary__item">
                            <div className="ons-summary__row ons-summary__row--has-values" id="password">
                                <dt className="ons-summary__item-title">
                                    <div className="ons-summary__item--text">Password</div>
                                </dt>
                                <dd className="ons-summary__values">
                                    <span className="ons-summary__text">{name ? "••••••••" : "Not found"}</span>
                                </dd>
                                <dd className="ons-summary__actions">
                                    {
                                        (
                                            name === currentUsername ?
                                                "Current user" :
                                                <Link to={"/users/changepassword/" + name} state={{ currentUser }} className="ons-summary__button">
                                                    <span className="ons-summary__button-text"
                                                        aria-hidden="true">
                                                Change
                                                    </span>
                                                    <span className="ons-u-vh">Change password</span>
                                                </Link>
                                        )
                                    }
                                </dd>
                            </div>
                        </div>
                    </dl>
                </div>
                <div id="roles-and-permissions" className="ons-summary__group">
                    <h2 className="ons-summary__group-title">Roles and permissions</h2>
                    <div id="role-row" className="ons-summary__item">
                        <div className="ons-summary__row ons-summary__row--has-values" id="role">
                            <dt className="ons-summary__item-title">
                                <div className="ons-summary__item--text">Role</div>
                            </dt>
                            <dd className="ons-summary__values">
                                <span className="ons-summary__text">{role ? role : "Not found"}</span>
                            </dd>
                            <dd className="ons-summary__actions">
                                <Link to={"/users/change-role/" + name} state={{ currentUser, viewedUserDetails }} className="ons-summary__button">
                                    <span className="ons-summary__button-text"
                                        aria-hidden="true">
                                                Change
                                    </span>
                                    <span className="ons-u-vh">Change role</span>
                                </Link>
                            </dd>
                        </div>
                    </div>
                    <div id="default-server-park-row" className="ons-summary__item">
                        <div className="ons-summary__row ons-summary__row--has-values" id="default-server-park">
                            <dt className="ons-summary__item-title">
                                <div className="ons-summary__item--text">Default Server Park</div>
                            </dt>
                            <dd className="ons-summary__values">
                                <span className="ons-summary__text">{defaultServerPark ? defaultServerPark : "Not found"}</span>
                            </dd>
                            <dd className="ons-summary__actions">
                            </dd>
                        </div>
                    </div>
                    <div id="server-parks-row" className="ons-summary__item">
                        <div className="ons-summary__row ons-summary__row--has-values" id="server-parks">
                            <dt className="ons-summary__item-title">
                                <div className="ons-summary__item--text">Server Parks</div>
                            </dt>
                            <dd className="ons-summary__values">
                                <span className="ons-summary__text">{serverParks ? serverParks.join(", ") : "Not found"}</span>
                            </dd>
                            <dd className="ons-summary__actions">
                            </dd>
                        </div>
                    </div>
                </div>
                <div id="actions" className="ons-summary__group">
                    <h2 className="ons-summary__group-title">Actions</h2>
                    <div id="actions-row">
                        {
                            (
                                name === currentUsername ?
                                    "Cannot delete current user" :
                                    <Link to={"/users/delete/" + name} className="ons-summary__button">
                                        <span className="ons-summary__button-text"
                                            aria-hidden="true">
                                                Delete
                                        </span>
                                        <span className="ons-u-vh">Delete user</span>
                                    </Link>
                            )
                        }
                    </div>
                </div>
            </div>
        </main>
    );
}