import { Button, Panel } from "blaise-design-system-react-components";
import { type FormEvent, type ReactElement, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

import { deleteUser } from "../../api/http";
import { type ReturnPanel, type UserRouteParams } from "../../types/users.types";

function DeleteUser(): ReactElement {
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [confirm, setConfirm] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [redirect, setRedirect] = useState<boolean>(false);
  const [redirectPath, setRedirectPath] = useState<string>("/users");
  const [returnPanel, setReturnPanel] = useState<ReturnPanel>({
    visible: false,
    message: "",
    status: "info",
  });
  const { user: viewedUsername }: UserRouteParams = useParams() as unknown as UserRouteParams;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void deleteUserConfirm();
  }

  async function deleteUserConfirm() {
    if (!confirm) {
      setRedirectPath(`/users/${viewedUsername}`);
      setRedirect(true);
      setReturnPanel({ visible: true, message: "Action discarded", status: "info" });

      return;
    }

    setButtonLoading(true);
    const deleted = await deleteUser(viewedUsername);

    if (!deleted) {
      setMessage("Failed to delete user");
      setButtonLoading(false);

      return;
    }

    setReturnPanel({
      visible: true,
      message: "Successfully deleted user " + viewedUsername,
      status: "success",
    });
    setRedirectPath("/users");
    setRedirect(true);
  }

  return (
    <>
      {redirect && (
        <Navigate
          to={{ pathname: redirectPath }}
          state={{ updatedPanel: returnPanel }}
        />
      )}
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-m"
      >
        <h1 className="ons-u-mb-l">
          Are you sure you want to delete user <em className="ons-highlight">{viewedUsername}</em>?
        </h1>

        <Panel
          hidden={message === ""}
          status="error"
        >
          {message}
        </Panel>

        <form onSubmit={handleSubmit}>
          <fieldset className="ons-fieldset">
            <legend className="ons-fieldset__legend">Confirm delete action</legend>
            <div className="ons-radios__items">
              <p className="ons-radios__item">
                <span className="ons-radio">
                  <input
                    type="radio"
                    id="yes-delete-item"
                    className="ons-radio__input ons-js-radio "
                    value="True"
                    name="confirm-delete"
                    aria-label="Yes"
                    checked={confirm}
                    onChange={() => setConfirm(true)}
                  />
                  <label
                    className="ons-radio__label "
                    htmlFor="yes-delete-item"
                  >
                    Yes, delete user {viewedUsername}
                  </label>
                </span>
              </p>
              <br />
              <p className="ons-radios__item">
                <span className="ons-radio">
                  <input
                    type="radio"
                    id="no-delete-item"
                    className="ons-radio__input ons-js-radio "
                    value="False"
                    name="confirm-delete"
                    aria-label="No"
                    checked={!confirm}
                    onChange={() => setConfirm(false)}
                  />
                  <label
                    className="ons-radio__label "
                    htmlFor="no-delete-item"
                  >
                    No, do not delete user {viewedUsername}
                  </label>
                </span>
              </p>
            </div>
          </fieldset>

          <br />
          <Button
            label={"Save"}
            primary={true}
            submit={true}
            loading={buttonLoading}
          />
        </form>
      </main>
    </>
  );
}

export default DeleteUser;
