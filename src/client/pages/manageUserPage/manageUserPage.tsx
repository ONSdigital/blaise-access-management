import { LoadingPanel, Panel } from "blaise-design-system-react-components";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getUser } from "../../api/http";
import { type ReturnPanel } from "../../types/users.types";
import { type GetUserResponse } from "../../types/usersApi.types";

import UserTable from "./sections/userTable";

import type { User } from "blaise-api-node-client";

type ManageUserPageProps = {
  currentUser: User;
  updatedPanel?: ReturnPanel | null;
};

export default function ManageUserPage({ currentUser, updatedPanel = null }: ManageUserPageProps) {
  const { user: viewedUsername } = useParams();
  const [viewedUserDetails, setViewedUserDetails] = useState<GetUserResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchUserDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUser(viewedUsername as string);

      if (!response.success) {
        setError(
          "Unable to load user details, please try again. If this continues, please the contact service desk.",
        );
        setViewedUserDetails(null);

        return;
      }

      setViewedUserDetails(response);
      setError("");
    } catch {
      setError(
        "Unable to load user details, please try again. If this continues, please the contact service desk.",
      );
      setViewedUserDetails(null);
    } finally {
      setLoading(false);
    }
  }, [viewedUsername]);

  useEffect(() => {
    if (viewedUsername) {
      fetchUserDetails();
    }
  }, [fetchUserDetails, viewedUsername]);

  return (
    <>
      {updatedPanel && updatedPanel.visible ? (
        <Panel status={updatedPanel.status}>{updatedPanel.message}</Panel>
      ) : null}
      {error && <Panel status={"error"}>{error}</Panel>}
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-m"
      >
        {loading ? (
          <LoadingPanel />
        ) : (
          viewedUserDetails && (
            <>
              <h1 className="ons-u-mb-l">{viewedUserDetails.data.name || "Not found"}</h1>
              <UserTable
                currentUser={currentUser}
                viewedUserDetails={viewedUserDetails}
              />
            </>
          )
        )}
      </main>
    </>
  );
}
