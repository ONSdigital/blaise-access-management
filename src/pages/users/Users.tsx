import React, { ReactElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User } from "blaise-api-node-client";
import { ExternalLink, ONSErrorPanel, ONSLoadingPanel } from "blaise-design-system-react-components";
import { getAllUsers } from "../../utilities/http";
import Breadcrumbs from "../../Components/Breadcrumbs";
import UsersTable from "./UsersTable";

interface Props {
    currentUser: User | undefined;
    externalCATIUrl: string;
}


function Users({ currentUser, externalCATIUrl }: Props): ReactElement {
    const [users, setUsers] = useState<User[]>([]);
    const [listError, setListError] = useState<string>("Loading ...");
    const [listLoading, setListLoading] = useState<boolean>(true);

    useEffect(() => {
        getUserList().then(() => console.log("Call getUserList Complete"));
    }, []);

    async function getUserList() {
        setUsers([]);
        setListLoading(true);

        const [success, questionnaireList] = await getAllUsers();
        setListLoading(false);

        if (!success) {
            setListError("Unable to load users.");
            return;
        }

        if (questionnaireList.length === 0) {
            setListError("No installed users found.");
        }

        setUsers(questionnaireList);
    }


    return <>
        <Breadcrumbs BreadcrumbList={
            [
                { link: "/", title: "Home" },
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
            <p className="ons-u-mt-m">
                <ExternalLink text={"Link to CATI dashboard"}
                    link={externalCATIUrl}
                    id={"cati-dashboard"} />
            </p>
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
