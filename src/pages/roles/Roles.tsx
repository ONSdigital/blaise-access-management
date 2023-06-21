import React, {ReactElement, useEffect, useState} from "react";
import {getAllRoles} from "../../utilities/http";
import {ONSErrorPanel, ONSLoadingPanel, ONSPanel} from "blaise-design-system-react-components";
import Breadcrumbs from "../../Components/Breadcrumbs";
import RolesTable from "./RolesTable";
import {UserRole} from "blaise-api-node-client";

function Roles(): ReactElement {
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [listError, setListError] = useState<string>("Loading ...");
    const [listLoading, setListLoading] = useState<boolean>(true);

    useEffect(() => {
        getRolesList().then(() => {return;});
    }, []);

    async function getRolesList() {
        setRoles([]);
        setListLoading(true);

        const [success, roleList] = await getAllRoles();
        setListLoading(false);

        if (!success) {
            setListError("Unable to load roles.");
            return;
        }

        if (roleList.length === 0) {
            setListError("No installed roles found.");
        }

        setRoles(roleList);
    }

    return (
        <>
            <Breadcrumbs BreadcrumbList={
                [
                    {link: "/", title: "Home"}
                ]
            } />

            <main id="main-content" className="ons-page__main ons-u-mt-no">
                <h1 className="ons-u-mb-l">Manage roles</h1>

                <ONSPanel>To ensure consistency across environments, DST are responsible for creating and managing roles. If you require a new role, please reach out to DST for assistance.</ONSPanel>

                {listError.includes("Unable") && <ONSErrorPanel />}

                {
                    listLoading ?
                        <ONSLoadingPanel />
                        :
                        <RolesTable roles={roles} listError={listError} />
                }
            </main>
        </>
    );
}

export default Roles;
