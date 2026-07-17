import { Panel, Table } from "blaise-design-system-react-components";
import { type ReactElement } from "react";
import { Link } from "react-router-dom";

import { type UsersTableProps } from "../../../types/users.types";

import type { User } from "blaise-api-node-client";

function UsersTable({ users, currentUser, listError }: UsersTableProps): ReactElement {
  return (
    <>
      {users && users.length > 0 ? (
        <Table
          id="users-table"
          columns={["Name", "Role"]}
          scrollableLabel="Users table"
        >
          {[...users]
            .sort((firstUser, secondUser) => firstUser.name.localeCompare(secondUser.name))
            .map((user: User) => (
              <tr
                className="ons-table__row"
                key={user.name}
                data-testid={"users-table-row"}
              >
                <td className="ons-table__cell">
                  <Link
                    to={"/users/" + user.name}
                    state={{ currentUser }}
                  >
                    {user.name}
                  </Link>
                  {user.name === currentUser?.name && <span> (Current user)</span>}
                </td>
                <td className="ons-table__cell">
                  {typeof user.role === "string" ? user.role : user.role?.name}
                </td>
              </tr>
            ))}
        </Table>
      ) : (
        <Panel>{listError}</Panel>
      )}
    </>
  );
}

export default UsersTable;
