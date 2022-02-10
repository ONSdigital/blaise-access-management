import { UserRole } from "blaise-api-node-client";
import React, { ReactElement } from "react";

interface RolesTableProps {
    roles: UserRole[];
    listError: string;
}

function RolesTable({ roles, listError }: RolesTableProps): ReactElement {
    return (
        <>
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
                            </tr>
                        </thead>
                        <tbody className="table__body">
                            {
                                roles.map(({ description, name, permissions }: UserRole) => {
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

export default RolesTable;
