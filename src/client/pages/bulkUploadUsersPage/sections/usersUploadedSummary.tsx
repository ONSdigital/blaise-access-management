import { Button, ErrorBoundary, Panel, Table } from "blaise-design-system-react-components";
import converter from "number-to-words";
import { type ReactElement, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { type UploadedUser } from "../../../types/userImport.types";
import { type UsersUploadedSummaryProps } from "../../../types/users.types";

function UsersUploadedSummary({
  usersUploaded,
  numberOfValidUsers,
}: UsersUploadedSummaryProps): ReactElement {
  const listError = "Loading ...";
  const numberOfCreatedUsers = useMemo(() => {
    let createdUsers = 0;

    usersUploaded.forEach((user: UploadedUser) => {
      if (user.created) {
        createdUsers = createdUsers + 1;
      }
    });

    return createdUsers;
  }, [usersUploaded]);
  const navigate = useNavigate();

  function failedToUploadUserTable() {
    return (
      <>
        <h2 className="ons-u-mt-xl">Users that were not created</h2>
        <ErrorBoundary errorMessageText={"Failed to load audit logs."}>
          {usersUploaded && usersUploaded.length > 0 ? (
            <Table
              id="batch-table"
              columns={["Username", "Upload status"]}
              scrollableLabel="Users not created table"
            >
              {usersUploaded.map(({ name, created }: UploadedUser) => {
                if (!created) {
                  return (
                    <tr
                      className="ons-table__row"
                      key={name}
                      data-testid={"batch-table-row"}
                    >
                      <td className="ons-table__cell ">{name}</td>
                      <td className="ons-table__cell ">
                        <span className="ons-status ons-status--error">{"User not created"}</span>
                      </td>
                    </tr>
                  );
                }

                return null;
              })}
            </Table>
          ) : (
            <Panel>{listError}</Panel>
          )}
        </ErrorBoundary>
      </>
    );
  }

  return (
    <>
      <h1 className="ons-u-mb-l">
        Uploaded{" "}
        <em>
          {converter.toWords(numberOfCreatedUsers)} of {converter.toWords(numberOfValidUsers)}
        </em>{" "}
        user{numberOfValidUsers > 1 && "s"} successfully
      </h1>

      {numberOfCreatedUsers !== numberOfValidUsers ? (
        <Panel status={"error"}>
          <p>
            Not all users were created successfully, you can review which users were not created
            successfully below.
          </p>
        </Panel>
      ) : (
        <Panel>
          <p>Users will appear in the table on the homepage and should be accessible in Blaise</p>
        </Panel>
      )}

      <br />
      <Button
        label={"Return to homepage"}
        primary={true}
        onClick={() => navigate("/")}
      />
      {numberOfCreatedUsers !== numberOfValidUsers && failedToUploadUserTable()}
    </>
  );
}

export default UsersUploadedSummary;
