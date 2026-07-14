import { LoadingPanel, Panel } from "blaise-design-system-react-components";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getUser } from "../../api/http";
import { type ReturnPanel } from "../../types/users.types";
import { type GetUserResponse } from "../../types/usersApi.types";
import UserSignInErrorPanel from "../shared/userSignInErrorPanel";

import UserTable from "./sections/userTable";

import type { User } from "blaise-api-node-client";

type ManageUserPageProps = {
  currentUser: User | null;
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
      const data = await getUser(viewedUsername as string);

      setViewedUserDetails(data);
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

  if (!currentUser) {
    return <UserSignInErrorPanel />;
  }

  return (
    <>
      {updatedPanel && updatedPanel.visible ? (
        <Panel status={updatedPanel.status}>
          <div className="ons-panel__body">{updatedPanel.message}</div>
        </Panel>
      ) : null}
      {error && (
        <Panel status={"error"}>
          <div className="ons-panel__body">{error}</div>
        </Panel>
      )}
      {loading ? (
        <LoadingPanel />
      ) : (
        viewedUserDetails && (
          <UserTable
            currentUser={currentUser}
            viewedUserDetails={viewedUserDetails}
          />
        )
      )}
    </>
  );
}
