import React, { ReactElement } from "react";
import { RolesTableProps } from "../../../Interfaces/rolesPage";
import { UserRole } from "blaise-api-node-client";

function RolesTable({ roles, listError }: RolesTableProps): ReactElement {
    return (
        <>
            {
                roles && roles.length > 0
                    ?
                    <table id="roles-table" className="ons-table ons-u-mt-m">
                        <thead className="ons-table__head">
                            <tr className="ons-table__row">
                                <th scope="col" className="ons-table__header ">
                                    <span>Name</span>
                                </th>
                                <th scope="col" className="ons-table__header ">
                                    <span>Description</span>
                                </th>
                                <th scope="col" className="ons-table__header ">
                                    <span>Number of permissions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="ons-table__body">
                            {
                                roles.map(({ description, name, permissions }: UserRole) => {
                                    return (
                                        <tr className="ons-table__row" key={name} data-testid={"user-table-row"}>
                                            <td className="ons-table__cell ">
                                                {name}
                                            </td>
                                            <td className="ons-table__cell ">
                                                {description}
                                            </td>
                                            <td className="ons-table__cell ">
                                                {permissions.length}
                                            </td>
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </table>
                    :
                    <div className="ons-panel ons-panel--info ons-panel--no-title ons-u-mb-m ons-u-mt-m">
                        <div className="ons-panel__body">
                            <p>{listError}</p>
                        </div>
                    </div>
            }
        </>
    );
}

export default RolesTable;
