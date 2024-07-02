import React, { ReactElement, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { User } from "blaise-api-node-client";
import { ONSErrorPanel, ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";
import { getAllUsers } from "../../api/http";
import UsersTable from "./UsersTable";
import { UsersProps } from "../../Interfaces/usersPage";
import Breadcrumbs from "../../Components/Breadcrumbs";

function Users({ currentUser }: UsersProps): ReactElement {
    const [users, setUsers] = useState<User[]>([]);
    const [listError, setListError] = useState<string>("Loading ...");
    const [listLoading, setListLoading] = useState<boolean>(true);
    const { state } = useLocation();
    const { updatedPanel } = state || { updatedPanel: null };

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
                { link: "/", title: "Home" }
            ]
        } />
        {updatedPanel && updatedPanel.visible ? (
            <ONSPanel status={updatedPanel.status}>
                <div className="ons-panel__body">{updatedPanel.message}</div>
            </ONSPanel>)
            : null }
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
