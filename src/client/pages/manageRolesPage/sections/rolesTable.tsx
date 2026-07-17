import { Panel, Table } from "blaise-design-system-react-components";
import { type ReactElement } from "react";

import { type RolesTableProps } from "../../../types/roles.types";

import type { UserRole } from "blaise-api-node-client";

function RolesTable({ roles, listError }: RolesTableProps): ReactElement {
  return (
    <>
      {roles && roles.length > 0 ? (
        <Table
          id="roles-table"
          columns={["Name", "Number of permissions"]}
          scrollableLabel="Roles table"
        >
          {[...roles]
            .sort((firstRole, secondRole) => firstRole.name.localeCompare(secondRole.name))
            .map(({ name, permissions }: UserRole) => {
              return (
                <tr
                  className="ons-table__row"
                  key={name}
                  data-testid={"user-table-row"}
                >
                  <td className="ons-table__cell ">{name}</td>
                  <td className="ons-table__cell ">{permissions.length}</td>
                </tr>
              );
            })}
        </Table>
      ) : (
        <Panel>{listError}</Panel>
      )}
    </>
  );
}

export default RolesTable;
