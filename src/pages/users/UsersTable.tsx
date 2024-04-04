import { User } from "blaise-api-node-client";
import { Link } from "react-router-dom";
import React, { ReactElement } from "react";
import { UsersTableProps } from "../../../Interfaces/usersPage";

function UsersTable({ users, currentUser, listError }: UsersTableProps): ReactElement {
    return <>
        {
            users && users.length > 0
                ?
                <table id="users-table" className="ons-table ons-u-mt-m">
                    <thead className="ons-table__head ">
                        <tr className="ons-table__row">
                            <th scope="col" className="ons-table__header ">
                                <span>Name</span>
                            </th>
                            <th scope="col" className="ons-table__header ">
                                <span>Role</span>
                            </th>
                            <th scope="col" className="ons-table__header ">
                                <span>Default server park</span>
                            </th>
                            {/*<th scope="col" className="ons-table__header ">*/}
                            {/*    <span>Edit user</span>*/}
                            {/*</th>*/}
                            <th scope="col" className="ons-table__header ">
                                <span>Change password</span>
                            </th>
                            <th scope="col" className="ons-table__header ">
                                <span>Delete user</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="ons-table__body">
                        {
                            users.map(({ role, defaultServerPark, name }: User) => {
                                return (
                                    <tr className="ons-table__row" key={name} data-testid={"users-table-row"}>
                                        <td className="ons-table__cell ">
                                            {name}
                                        </td>
                                        <td className="ons-table__cell ">
                                            {role}
                                        </td>
                                        <td className="ons-table__cell ">
                                            {defaultServerPark}
                                        </td>
                                        {/*<td className="ons-table__cell ">*/}
                                        {/*    <Link to={"/survey/" + item.name}>Edit</Link>*/}
                                        {/*</td>*/}
                                        <td className="ons-table__cell ">
                                            <Link to={"/users/changepassword/" + name}>Change password</Link>
                                        </td>
                                        <td className="ons-table__cell ">
                                            {
                                                (
                                                    name === currentUser?.name ?
                                                        "Currently signed in user" :
                                                        <Link to={"/users/delete/" + name}>Delete</Link>
                                                )
                                            }
                                        </td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
                :
                <div className="ons-panel ons-panel--info ons-panel--no-title ons-u-mb-m">
                    <div className="ons-panel__body">
                        <p>{listError}</p>
                    </div>
                </div>

        }
    </>;
}

export default UsersTable;
