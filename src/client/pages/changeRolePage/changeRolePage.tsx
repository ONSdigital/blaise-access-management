import { Button, LoadingPanel, Panel, Select } from "blaise-design-system-react-components";
import { type FormEvent, type ReactElement, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";

import { getAllRoles, patchUserRolesAndPermissions } from "../../api/http";
import { type RedirectWithData, type UserRouteParams } from "../../types/users.types";
import UserSignInErrorPanel from "../shared/userSignInErrorPanel";

import type { UserRole } from "blaise-api-node-client";

export default function ChangeRole(): ReactElement {
  const navigate = useNavigate();
  const { user: viewedUsername }: UserRouteParams = useParams() as unknown as UserRouteParams;
  const { state } = useLocation();
  const { currentUser, viewedUserDetails } = state || {
    currentUser: null,
    viewedUserDetails: null,
  };
  const [role, setRole] = useState<string>(viewedUserDetails?.data?.role ?? "");
  const [roleList, setRoleList] = useState<UserRole[]>([]);
  const [redirectWithData, setRedirectWithData] = useState<RedirectWithData>({
    redirect: false,
    visible: false,
    message: "",
    statusType: "",
  });
  const [setError, setSetError] = useState<string | null>(null);
  const [setLoading, setSetLoading] = useState<boolean>(true);

  const getRoleList = async () => {
    try {
      const [, roleList] = await getAllRoles();

      setRoleList(roleList);
      setSetLoading(false);
    } catch {
      setSetError("Failed to fetch roles list, please try again");
      setSetLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void changeBlaiseUserRolesAndServerParks();
  };

  const changeBlaiseUserRolesAndServerParks = async () => {
    if (!viewedUserDetails || !viewedUserDetails.data) {
      console.log("Viewed user details is undefined or null");

      return;
    }

    if (role === viewedUserDetails.role) {
      console.log("User already has role: ", role);

      return;
    }

    if (roleList.some((userRole) => userRole.name === role)) {
      const res = await patchUserRolesAndPermissions(viewedUsername, role);

      setRedirectWithData({
        redirect: true,
        visible: true,
        message: res?.message || "",
        statusType: res?.status === 500 ? "error" : "success",
      });
    } else {
      window.alert(`Invalid role: ${role}`);
      console.log("Invalid Role:", role);

      return;
    }
  };

  useEffect(() => {
    getRoleList();
  }, []);

  if (!currentUser || !viewedUserDetails || setError) {
    return setError ? <Panel status="error">{setError}</Panel> : <UserSignInErrorPanel />;
  }

  return (
    <>
      {redirectWithData.redirect && (
        <Navigate
          to={{ pathname: `/users/${viewedUsername}` }}
          state={{
            currentUser,
            updatedPanel: {
              visible: redirectWithData.visible,
              message: redirectWithData.message,
              status: redirectWithData.statusType,
            },
          }}
        />
      )}
      {setLoading ? (
        <LoadingPanel />
      ) : (
        <main
          id="main-content"
          className="ons-page__main ons-u-mt-m"
        >
          <h1 className="ons-u-mb-l">
            Change role for user <em className="ons-highlight">{viewedUsername}</em>
          </h1>
          <form onSubmit={handleSubmit}>
            <Select
              id="new-user-role"
              label="New role"
              name="select-role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              options={roleList.map((option: UserRole) => ({
                label: option.name,
                value: option.name,
              }))}
            />
            <div className="ons-u-mt-m">
              <Button
                label={"Save"}
                primary={true}
                submit={true}
              />
              <Button
                label={"Cancel"}
                primary={false}
                onClick={() =>
                  navigate(`/users/${viewedUsername}`, {
                    state: { currentUser },
                  })
                }
              />
            </div>
          </form>
        </main>
      )}
    </>
  );
}
