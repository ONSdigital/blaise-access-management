import { ErrorPanel, LoadingPanel, Panel, TextInput } from "blaise-design-system-react-components";
import { type ReactElement, useState } from "react";
import { Link } from "react-router-dom";

import { getAllUsers } from "../../api/http";
import { useListLoader } from "../../hooks/useListLoader";
import { type ReturnPanel, type UsersProps } from "../../types/users.types";

import UsersTable from "./sections/usersTable";

import type { User } from "blaise-api-node-client";

type ManageUsersPageProps = UsersProps & {
  updatedPanel?: ReturnPanel | null;
};

function ManageUsersPage({ currentUser, updatedPanel = null }: ManageUsersPageProps): ReactElement {
  const [filterText, setFilterText] = useState<string>("");
  const {
    list: users,
    isLoading: listLoading,
    listError,
  } = useListLoader<User>({
    load: getAllUsers,
    unableToLoadMessage: "Unable to load users.",
    emptyListMessage: "No installed users found.",
    initialError: "Loading ...",
  });

  function filterUsersList(usersList: User[], filterValue: string): User[] {
    if (usersList.length === 0) {
      return [];
    }

    return usersList.filter((user) => {
      if (filterValue.trim() === "") {
        return true;
      }

      return user.name.toUpperCase().includes(filterValue.toUpperCase());
    });
  }

  const filteredUsersList = filterUsersList(users, filterText);
  const usersListMessage =
    users.length > 0 && filteredUsersList.length === 0
      ? `No users containing ${filterText} found.`
      : listError;

  return (
    <>
      {updatedPanel && updatedPanel.visible ? (
        <Panel status={updatedPanel.status}>{updatedPanel.message}</Panel>
      ) : null}
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-m"
      >
        <h1 className="ons-u-mb-l">Manage users</h1>
        <ul className="ons-list ons-list--bare ons-list--inline ons-u-mb-m">
          <li className="ons-list__item ">
            <Link to={"/users/new"}>Create new user</Link>
          </li>
          <li className="ons-list__item ">
            <Link to={"/users/upload"}>Bulk upload users</Link>
          </li>
        </ul>
        {listError.includes("Unable") && <ErrorPanel />}
        {listLoading ? (
          <LoadingPanel />
        ) : (
          <>
            <div className="ons-field ons-u-mb-s">
              <TextInput
                id="filter-by-name"
                label="Filter by user name"
                onChange={(event) => setFilterText(event.target.value)}
                value={filterText}
              />
            </div>
            <h3 aria-live="polite">
              {filteredUsersList.length} results of {users.length}
            </h3>
            <UsersTable
              users={filteredUsersList}
              currentUser={currentUser}
              listError={usersListMessage}
            />
          </>
        )}
      </main>
    </>
  );
}

export default ManageUsersPage;
