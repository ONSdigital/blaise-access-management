import { ErrorBoundary, Panel, Table } from "blaise-design-system-react-components";
import converter from "number-to-words";
import { type ReactElement, useCallback, useEffect, useState } from "react";

import { validateImportedUsers } from "../../../api/validation/userValidation";
import { type ImportUser } from "../../../types/userImport.types";
import { type UsersToUploadSummaryProps } from "../../../types/users.types";

import Confirmation from "./confirmation";

function UsersToUploadSummary({
  usersToImport,
  uploadUsers,
}: UsersToUploadSummaryProps): ReactElement {
  const [userList, setUserList] = useState<ImportUser[]>([]);
  const [listError, setListError] = useState<string>("Loading ...");
  const [noValidUsers, setNoValidUsers] = useState<number>(0);

  const setupUserList = useCallback(async () => {
    setListError("Loading...");

    try {
      await validateImportedUsers(usersToImport);
    } catch {
      setListError("Unable to validate imported users");
      setUserList([]);

      return;
    }

    let noValid = 0;

    usersToImport.forEach((user: ImportUser) => {
      if (user.valid) {
        noValid = noValid + 1;
      }
    });

    setNoValidUsers(noValid);
    usersToImport.sort((a, b) => (a.valid ? 1 : 0) - (b.valid ? 1 : 0));

    if (usersToImport.length === 0) {
      setListError("No users found to upload");
    }

    setUserList(usersToImport);
  }, [usersToImport]);

  useEffect(() => {
    void setupUserList();
  }, [setupUserList]);

  return (
    <>
      <h1 className="ons-u-mb-l">
        Upload <em>{converter.toWords(noValidUsers)}</em> user{noValidUsers > 1 && "s"}?
      </h1>
      <div data-testid="summary-panel">
        <Panel>
          <p>
            {noValidUsers} of {userList.length} users are valid and will be uploaded.
          </p>
        </Panel>
      </div>

      <Confirmation
        validUsers={noValidUsers}
        uploadUsers={uploadUsers}
      />
      <h2 className="ons-u-mt-xl">Users to upload</h2>
      <ErrorBoundary errorMessageText={"Failed to load audit logs."}>
        {userList && userList.length > 0 ? (
          <Table
            id="batch-table"
            columns={["Username", "Role", "User validity"]}
            scrollableLabel="Users to upload table"
          >
            {userList.map(({ name, role, valid, warnings }: ImportUser, index: number) => {
              return (
                <tr
                  className="ons-table__row"
                  key={`${name}-${role}`}
                  data-testid={"user-table-row-" + index}
                >
                  <td className="ons-table__cell ">{name}</td>
                  <td className="ons-table__cell ">{role}</td>
                  <td className="ons-table__cell ">
                    <span className={`ons-status ons-status--${valid ? "success" : "error"}`}>
                      {valid
                        ? "Valid"
                        : warnings.map((message) => {
                            return `${message}`;
                          })}
                    </span>
                  </td>
                </tr>
              );
            })}
          </Table>
        ) : (
          <Panel>{listError}</Panel>
        )}
      </ErrorBoundary>
    </>
  );
}

export default UsersToUploadSummary;
