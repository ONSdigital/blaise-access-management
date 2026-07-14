import { ErrorPanel, LoadingPanel, Panel } from "blaise-design-system-react-components";
import { type ReactElement, useEffect, useState } from "react";

import { getAllRoles } from "../../api/http";

import RolesTable from "./sections/rolesTable";

import type { UserRole } from "blaise-api-node-client";

function ManageRolesPage(): ReactElement {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [listError, setListError] = useState<string>("Loading ...");
  const [listLoading, setListLoading] = useState<boolean>(true);

  useEffect(() => {
    getRolesList().then(() => {
      return;
    });
  }, []);

  async function getRolesList() {
    setRoles([]);
    setListLoading(true);

    const [success, roleList] = await getAllRoles();

    setListLoading(false);

    if (!success) {
      setListError("Unable to load roles.");

      return;
    }

    if (roleList.length === 0) {
      setListError("No installed roles found.");
    }

    setRoles(roleList);
  }

  return (
    <>
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-m"
      >
        <h1 className="ons-u-mb-l">Manage roles</h1>

        <div className="ons-u-mb-m">
          <Panel>
            To ensure consistency across environments, DST are responsible for creating and managing
            roles. If you require a new role, please reach out to DST for assistance.
          </Panel>
        </div>

        {listError.includes("Unable") && <ErrorPanel />}

        {listLoading ? (
          <LoadingPanel />
        ) : (
          <RolesTable
            roles={roles}
            listError={listError}
          />
        )}
      </main>
    </>
  );
}

export default ManageRolesPage;
