import { Button, LoadingPanel, Panel, Select } from "blaise-design-system-react-components";
import { type FormEvent, type ReactElement, useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { getAllRoles, getUser, patchUserRolesAndPermissions } from "../../api/http";
import { type RedirectWithData, type UserRouteParams } from "../../types/users.types";
import { type GetUserResponse } from "../../types/usersApi.types";
import { clientLogger } from "../../utils/logger";

import type { User, UserRole } from "blaise-api-node-client";

type ChangeRoleProps = {
  currentUser: User;
};

function getRoleName(role: User["role"]): string {
  if (typeof role === "string") {
    return role;
  }

  return role?.name ?? "";
}

function hasRoleData(
  userDetails: GetUserResponse | null,
): userDetails is GetUserResponse & { data: User } {
  return Boolean(userDetails && "role" in userDetails.data);
}

export default function ChangeRole({ currentUser }: ChangeRoleProps): ReactElement {
  const navigate = useNavigate();
  const { user: viewedUsername }: UserRouteParams = useParams() as unknown as UserRouteParams;
  const [viewedUserDetails, setViewedUserDetails] = useState<GetUserResponse | null>(null);
  const [role, setRole] = useState<string>("");
  const [roleList, setRoleList] = useState<UserRole[]>([]);
  const [redirectWithData, setRedirectWithData] = useState<RedirectWithData>({
    redirect: false,
    visible: false,
    message: "",
    statusType: "",
  });
  const [setError, setSetError] = useState<string | null>(null);
  const [setLoading, setSetLoading] = useState<boolean>(true);

  const getRoleList = useCallback(async () => {
    try {
      const { data: roleList } = await getAllRoles();

      setRoleList(roleList);
    } catch {
      setSetError("Failed to fetch roles list, please try again");
    }
  }, []);

  const getViewedUserDetails = useCallback(async () => {
    try {
      const response = await getUser(viewedUsername);

      if (!response.success) {
        setSetError("Unable to load user details, please try again");

        return;
      }

      if (!("role" in response.data)) {
        setSetError("Unable to load user details, please try again");

        return;
      }

      setViewedUserDetails(response);
      setRole(getRoleName(response.data.role));
    } catch {
      setSetError("Unable to load user details, please try again");
    }
  }, [viewedUsername]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void changeBlaiseUserRolesAndServerParks();
  };

  const changeBlaiseUserRolesAndServerParks = async () => {
    setSetError(null);

    if (!hasRoleData(viewedUserDetails)) {
      const message =
        "Unable to change role because user details are unavailable. Please reload and try again.";

      setSetError(message);
      clientLogger.error("Change role failed: viewed user details missing", {
        viewedUsername,
      });

      return;
    }

    if (role === getRoleName(viewedUserDetails.data.role)) {
      const message = "Please select a different role before saving.";

      setSetError(message);

      return;
    }

    if (roleList.some((userRole) => userRole.name === role)) {
      const previousRole = getRoleName(viewedUserDetails.data.role);
      const res = await patchUserRolesAndPermissions(viewedUsername, role, previousRole);

      setRedirectWithData({
        redirect: true,
        visible: true,
        message: res?.message || "",
        statusType: res?.status === 500 ? "error" : "success",
      });

      if (res?.status === 500) {
        setSetError("Failed to update role, please try again.");
        clientLogger.error("Change role failed: server returned error", {
          viewedUsername,
          role,
          status: res?.status,
          message: res?.message,
        });
      }
    } else {
      const message = "Selected role is invalid. Please choose a role from the list.";

      setSetError(message);
      clientLogger.warn("Change role blocked: invalid role selected", {
        viewedUsername,
        role,
      });

      return;
    }
  };

  useEffect(() => {
    void Promise.all([getRoleList(), getViewedUserDetails()]).finally(() => {
      setSetLoading(false);
    });
  }, [getRoleList, getViewedUserDetails]);

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
          {setError && (
            <div className="ons-u-mb-m">
              <Panel status="error">{setError}</Panel>
            </div>
          )}
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
