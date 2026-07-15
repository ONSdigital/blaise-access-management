import { Button, Panel, PasswordInput } from "blaise-design-system-react-components";
import { type ReactElement, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { editPassword } from "../../api/http/users";
import { type UserRouteParams } from "../../types/users.types";

import type { User } from "blaise-api-node-client";

type ChangePasswordProps = {
  currentUser: User;
};

export default function ChangePassword({ currentUser }: ChangePasswordProps): ReactElement {
  const navigate = useNavigate();
  const { user: viewedUsername }: UserRouteParams = useParams() as unknown as UserRouteParams;
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [redirect, setRedirect] = useState<boolean>(false);

  const changePassword = async () => {
    const sanitisedPassword = password.trim();
    const sanitisedConfirmPassword = confirmPassword.trim();

    if (sanitisedPassword === "" || sanitisedConfirmPassword === "") {
      setMessage("Passwords cannot be blank");

      return;
    }

    if (sanitisedPassword !== sanitisedConfirmPassword) {
      setMessage("Passwords do not match");

      return;
    }

    setButtonLoading(true);
    try {
      const response = await editPassword(viewedUsername, sanitisedPassword);

      if (!response.success) {
        setMessage("Set password failed");
        setButtonLoading(false);

        return;
      }
    } catch {
      setMessage("Set password failed");
      setButtonLoading(false);

      return;
    }

    setButtonLoading(false);
    setRedirect(true);
  };

  return (
    <>
      {redirect && (
        <Navigate
          to={{ pathname: `/users/${viewedUsername}` }}
          state={{
            currentUser,
            updatedPanel: {
              visible: true,
              message: "Password successfully changed for user " + viewedUsername,
              status: "success",
            },
          }}
        />
      )}
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-m"
      >
        <h1 className="ons-u-mb-l">
          Change password for user <em className="ons-highlight">{viewedUsername}</em>
        </h1>
        <div className="ons-u-mb-m">
          <Panel
            hidden={message === ""}
            status="error"
          >
            {message}
          </Panel>
        </div>
        <form onSubmit={() => changePassword()}>
          <PasswordInput
            label={"New password"}
            id={"new-password"}
            autoFocus={true}
            value={password}
            onChange={(_e, value) => setPassword(value)}
          />
          <PasswordInput
            label={"Confirm password"}
            id={"confirm-password"}
            value={confirmPassword}
            onChange={(_e, value) => setConfirmPassword(value)}
          />
          <div className="ons-u-mt-m">
            <Button
              label={"Save"}
              primary={true}
              loading={buttonLoading}
              onClick={() => changePassword()}
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
    </>
  );
}
