import { User } from "blaise-api-node-client";
import { Link } from "react-router-dom";
import React, { ReactElement } from "react";

interface UsersTableProps {
    users: User[];
    currentUser: User | undefined;
    listError: string;
}

function UsersTable({ users, currentUser, listError }: UsersTableProps): ReactElement {
    return <>
        {
            users && users.length > 0
                ?
                <table id="users-table" className="table u-mt-m">
                    <thead className="table__head ">
                        <tr className="table__row">
                            <th scope="col" className="table__header ">
                                <span>Name</span>
                            </th>
                            <th scope="col" className="table__header ">
                                <span>Role</span>
                            </th>
                            <th scope="col" className="table__header ">
                                <span>Default server park</span>
                            </th>
                            {/*<th scope="col" className="table__header ">*/}
                            {/*    <span>Edit user</span>*/}
                            {/*</th>*/}
                            <th scope="col" className="table__header ">
                                <span>Change password</span>
                            </th>
                            <th scope="col" className="table__header ">
                                <span>Delete user</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="table__body">
                        {
                            users.map(({ role, defaultServerPark, name }: User) => {
                                return (
                                    <tr className="table__row" key={name} data-testid={"users-table-row"}>
                                        <td className="table__cell ">
                                            {name}
                                        </td>
                                        <td className="table__cell ">
                                            {role}
                                        </td>
                                        <td className="table__cell ">
                                            {defaultServerPark}
                                        </td>
                                        {/*<td className="table__cell ">*/}
                                        {/*    <Link to={"/survey/" + item.name}>Edit</Link>*/}
                                        {/*</td>*/}
                                        <td className="table__cell ">
                                            <Link to={"/users/changepassword/" + name}>Change password</Link>
                                        </td>
                                        <td className="table__cell ">
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
                <div className="panel panel--info panel--no-title u-mb-m">
                    <div className="panel__body">
                        <p>{listError}</p>
                    </div>
                </div>

        }
    </>;
}

export default UsersTable;
