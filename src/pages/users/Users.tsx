import React, {ReactElement, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {User} from "blaise-api-node-client";
import {ONSErrorPanel, ONSLoadingPanel} from "blaise-design-system-react-components";
import {getAllUsers} from "../../utilities/http";
import Breadcrumbs from "../../Components/Breadcrumbs";
import UsersTable from "./UsersTable";

interface Props {
    currentUser: User | undefined;
}

function Users({currentUser}: Props): ReactElement {
    const [users, setUsers] = useState<User[]>([]);
    const [listError, setListError] = useState<string>("Loading ...");
    const [listLoading, setListLoading] = useState<boolean>(true);

    useEffect(() => {
        getUserList().then(() => {return;});
    }, []);

    async function getUserList() {
        setUsers([]);
        setListLoading(true);

        const [success, usersList] = await getAllUsers();
        setListLoading(false);

        if (!success) {
            setListError("Unable to load users.");
            return;
        }

        if (usersList.length === 0) {
            setListError("No installed users found.");
        }

        setUsers(usersList);
    }

    return <>
        <Breadcrumbs BreadcrumbList={
            [
                {link: "/", title: "Home"}
            ]
        } />

        <main id="main-content" className="ons-page__main ons-u-mt-no">
            <h1 className="ons-u-mb-l">Manage users</h1>
            <ul className="ons-list ons-list--bare ons-list--inline ">
                <li className="ons-list__item ">
                    <Link to={"/users/new"}>
                        Create new user
                    </Link>
                </li>
                <li className="ons-list__item ">
                    <Link to={"/users/upload"}>
                        Bulk upload users
                    </Link>
                </li>
            </ul>
            {listError.includes("Unable") && <ONSErrorPanel />}

            {
                listLoading ?
                    <ONSLoadingPanel />
                    :
                    <UsersTable users={users} currentUser={currentUser} listError={listError} />
            }
        </main>
    </>;
}

export default Users;
