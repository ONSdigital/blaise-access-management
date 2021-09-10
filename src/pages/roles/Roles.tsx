import React, {ReactElement, useEffect, useState} from "react";
import {Role} from "../../../Interfaces";
import {getAllRoles} from "../../utilities/http";
import {Link} from "react-router-dom";
import {ONSErrorPanel} from "blaise-design-system-react-components";

function Roles(): ReactElement {
    const [roles, setRoles] = useState<Role[]>([]);
    const [listError, setListError] = useState<string>("Loading ...");


    useEffect(() => {
        getRolesList().then(() => console.log("Call getRolesList Complete"));
    }, []);

    async function getRolesList() {
        setRoles([]);

        const [success, roleList] = await getAllRoles();

        if (!success) {
            setListError("Unable to load roles.");
            return;
        }

        console.log(roleList);

        if (roleList.length === 0) {
            setListError("No installed roles found.");
        }

        setRoles(roleList);
    }


    return (
        <>
            <p className="u-mt-m">
                <Link to={"/"}>Previous</Link>
            </p>
            <h1 className="u-mt-s">Manage roles</h1>

            <ul className="list list--bare list--inline ">
                <li className="list__item ">
                    <Link to={"/roles/new"}>
                        Create new role
                    </Link>
                </li>
            </ul>

            {listError.includes("Unable") && <ONSErrorPanel/>}

            {
                roles && roles.length > 0
                    ?
                    <table id="roles-table" className="table u-mt-m">
                        <thead className="table__head">
                        <tr className="table__row">
                            <th scope="col" className="table__header ">
                                <span>Name</span>
                            </th>
                            <th scope="col" className="table__header ">
                                <span>Description</span>
                            </th>
                            <th scope="col" className="table__header ">
                                <span>Number of permissions</span>
                            </th>
                            {/*<th scope="col" className="table__header ">*/}
                            {/*    <span>Edit role</span>*/}
                            {/*</th>*/}
                            {/*<th scope="col" className="table__header ">*/}
                            {/*    <span>Delete role</span>*/}
                            {/*</th>*/}
                        </tr>
                        </thead>
                        <tbody className="table__body">
                        {
                            roles.map(({description, name, permissions}: Role) => {
                                return (
                                    <tr className="table__row" key={name} data-testid={"user-table-row"}>
                                        <td className="table__cell ">
                                            {name}
                                        </td>
                                        <td className="table__cell ">
                                            {description}
                                        </td>
                                        <td className="table__cell ">
                                            {permissions.length}
                                        </td>
                                        {/*<td className="table__cell ">*/}
                                        {/*    <Link to={"/survey/" + item.name}>Edit</Link>*/}
                                        {/*</td>*/}
                                        {/*<td className="table__cell ">*/}
                                        {/*    <Link to={"/roles/delete/" + item.name}>Delete</Link>*/}
                                        {/*</td>*/}

                                    </tr>
                                );
                            })
                        }
                        </tbody>
                    </table>
                    :
                    <div className="panel panel--info panel--no-title u-mb-m u-mt-m">
                        <div className="panel__body">
                            <p>{listError}</p>
                        </div>
                    </div>
            }
        </>
    );
}

export default Roles;
