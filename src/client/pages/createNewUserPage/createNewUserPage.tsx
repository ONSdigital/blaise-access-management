import {
  Button,
  Panel,
  PasswordInput,
  Select,
  TextInput,
} from "blaise-design-system-react-components";
import { type FormEvent, type ReactElement, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { addNewUser, getAllRoles } from "../../api/http";

import type { NewUser, UserRole } from "blaise-api-node-client";

type NewUserFormState = {
  username: string;
  password: string;
  confirmPassword: string;
};

function validateNewUserForm(
  { confirmPassword, password, username }: NewUserFormState,
  role: string,
) {
  const errors: string[] = [];

  if (!username.trim()) {
    errors.push("Enter username");
  }

  if (!password.trim()) {
    errors.push("Enter password");
  }

  if (!confirmPassword.trim()) {
    errors.push("Enter confirm password");
  }

  if (confirmPassword.trim() && password.trim() !== confirmPassword.trim()) {
    errors.push("Must match password");
  }

  if (!role.trim()) {
    errors.push("Select a role");
  }

  return errors;
}

function CreateNewUserPage(): ReactElement {
  const navigate = useNavigate();
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [createdUsername, setCreatedUsername] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState<NewUserFormState>({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [redirect, setRedirect] = useState<boolean>(false);
  const [roleList, setRoleList] = useState<UserRole[]>([]);

  async function createNewUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const errors = validateNewUserForm(formData, role);

    if (errors.length > 0) {
      setFormErrors(errors);

      return;
    }

    const newUser: NewUser = {
      name: formData.username.trim(),
      password: formData.password.trim(),
      role,
      defaultServerPark: "",
      serverParks: [],
    };

    setButtonLoading(true);
    setCreatedUsername(newUser.name);

    const created = await addNewUser(newUser);

    if (!created) {
      setMessage("Failed to create new user");
      setButtonLoading(false);

      return;
    }

    setRedirect(true);
  }

  useEffect(() => {
    getRoleList().then(() => {
      return;
    });
  }, []);

  async function getRoleList() {
    setRoleList([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_success, roleList] = await getAllRoles();

    setRole(roleList[0]?.name ?? "");
    setRoleList(roleList);
  }

  return (
    <>
      {redirect && (
        <Navigate
          to={{ pathname: "/users" }}
          state={{
            updatedPanel: {
              visible: true,
              message: "User " + createdUsername + " created",
              status: "success",
            },
          }}
        />
      )}
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-m"
      >
        <h1 className="ons-u-mb-l">Create new user</h1>
        <Panel
          hidden={message === ""}
          status="error"
        >
          {message}
        </Panel>
        {formErrors.length > 0 && (
          <Panel status="error">
            <ul className="ons-list ons-list--bare">
              {formErrors.map((error) => (
                <li
                  key={error}
                  className="ons-list__item"
                >
                  {error}
                </li>
              ))}
            </ul>
          </Panel>
        )}

        <form onSubmit={createNewUser}>
          <TextInput
            id="username"
            label="Username"
            value={formData.username}
            onChange={(_event, value) => {
              setFormErrors([]);
              setFormData((current) => ({
                ...current,
                username: value,
              }));
            }}
          />
          <PasswordInput
            id="password"
            label="Password"
            value={formData.password}
            onChange={(_event, value) => {
              setFormErrors([]);
              setFormData((current) => ({
                ...current,
                password: value,
              }));
            }}
          />
          <PasswordInput
            id="confirm-password"
            label="Confirm password"
            value={formData.confirmPassword}
            onChange={(_event, value) => {
              setFormErrors([]);
              setFormData((current) => ({
                ...current,
                confirmPassword: value,
              }));
            }}
          />
          <Select
            id="role"
            label="Role"
            value={role}
            onChange={(event) => {
              setFormErrors([]);
              setRole(event.target.value);
            }}
            options={roleList.map((option: UserRole) => ({
              label: option.name,
              value: option.name,
            }))}
          />
          <div className="ons-u-mt-m">
            <Button
              label={"Save"}
              primary={true}
              loading={buttonLoading}
              submit={true}
            />
            <Button
              label={"Cancel"}
              primary={false}
              onClick={() => navigate("/users")}
            />
          </div>
        </form>
      </main>
    </>
  );
}

export default CreateNewUserPage;
