import React, {ReactElement, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {User} from "../../../Interfaces";
import {ExternalLink, ONSErrorPanel} from "blaise-design-system-react-components";
import {getAllUsers} from "../../utilities/http";

interface Props {
    currentUser: User
    externalCATIUrl: string
}

function Users({currentUser, externalCATIUrl}: Props): ReactElement {
    const [users, setUsers] = useState<User[]>([]);
    const [listError, setListError] = useState<string>("Loading ...");

    useEffect(() => {
        getUserList().then(() => console.log("Call getUserList Complete"));
    }, []);

    async function getUserList() {
        setUsers([]);

        const [success, instrumentList] = await getAllUsers();

        if (!success) {
            setListError("Unable to load users.");
            return;
        }

        if (instrumentList.length === 0) {
            setListError("No installed users found.");
        }

        setUsers(instrumentList);
    }


    return <>
        <p className="u-mt-m">
            <Link to={"/"}>Previous</Link>
        </p>
        <h1 className="u-mt-s">Manage users</h1>
        <ul className="list list--bare list--inline ">
            <li className="list__item ">
                <Link to={"/user"}>
                    Create new user
                </Link>
            </li>
            <li className="list__item ">
                <Link to={"/user/upload"}>
                    Bulk upload users
                </Link>
            </li>
        </ul>
        <p className="u-mt-m">
            <ExternalLink text={"Link to CATI dashboard"}
                          link={externalCATIUrl}
                          id={"cati-dashboard"}/>
        </p>
        {listError.includes("Unable") && <ONSErrorPanel/>}

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
                        users.map(({role, defaultServerPark, name}: User) => {
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
                                        <Link to={"/user/changepassword/" + name}>Change password</Link>
                                    </td>
                                    <td className="table__cell ">
                                        {
                                            (
                                                name === currentUser.name ?
                                                    "Currently signed in user" :
                                                    <Link to={"/user/delete/" + name}>Delete</Link>
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

export default Users;
