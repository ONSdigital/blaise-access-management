import axios from "axios";

import {
  type GetUserResponse,
  type GetUsersListResponse,
  type PatchUserRoleResponse,
} from "../../types/usersApi.types";

import { getAxiosAuthConfig } from "./axiosAuthConfig";
import { handleAxiosError } from "./errors";
import { fetchJson, fetchJsonList } from "./fetchJson";

import type { NewUser, User } from "blaise-api-node-client";

async function getAllUsers(): Promise<GetUsersListResponse> {
  try {
    const url = "/api/users";
    const [success, data] = await fetchJsonList<User>("GET", url);

    return [success, data] as GetUsersListResponse;
  } catch {
    return [false, []] as GetUsersListResponse;
  }
}

async function getUser(user: string): Promise<GetUserResponse> {
  try {
    const url = `/api/users/${user}`;

    const res = await axios.get(url, getAxiosAuthConfig());

    return {
      status: res.status,
      message: res.data.message,
      data: res.data.data,
    };
  } catch (error) {
    const errorObj = handleAxiosError(error);

    console.error(errorObj.message, { ...errorObj, data: {}, error: error });
    throw new Error(errorObj.message, { cause: error });
  }
}

function addNewUser(newUser: NewUser): Promise<boolean> {
  const url = "/api/users";

  return new Promise((resolve: (object: boolean) => void) => {
    if (!newUser.password) {
      resolve(false);

      return;
    }

    const formData = new FormData();

    formData.append("name", newUser.name);
    formData.append("password", newUser.password);
    const roleName = typeof newUser.role === "string" ? newUser.role : newUser.role.name;

    formData.append("role", roleName);

    fetchJson("POST", url, formData)
      .then(([status]) => {
        if (status === 200 || status === 201) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .catch(() => {
        resolve(false);
      });
  });
}

function deleteUser(username: string): Promise<boolean> {
  const url = "/api/users";

  const headers = {
    user: username,
  };

  return new Promise((resolve: (object: boolean) => void) => {
    fetchJson("DELETE", url, null, headers)
      .then(([status]) => {
        if (status === 204) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .catch(() => {
        resolve(false);
      });
  });
}

async function patchUserRolesAndPermissions(
  user: string,
  role: string,
): Promise<PatchUserRoleResponse> {
  try {
    const url = `/api/users/${user}/rolesAndPermissions`;
    const data = { role };

    const res = await axios.patch(url, data, getAxiosAuthConfig());

    return {
      status: res.status,
      message: res.data.message,
    };
  } catch (error) {
    const errorObj = handleAxiosError(error);

    console.error(errorObj.message, errorObj);

    return errorObj;
  }
}

function editPassword(username: string, newPassword: string): Promise<boolean> {
  const url = "/api/change-password/" + username;

  return new Promise((resolve: (object: boolean) => void) => {
    if (username == "" || username == undefined || newPassword == "" || newPassword == undefined) {
      resolve(false);

      return;
    }

    const formData = new FormData();

    formData.append("password", newPassword);

    fetchJson("POST", url, formData)
      .then(([status]) => {
        if (status === 204) resolve(true);
        resolve(false);
      })
      .catch(() => {
        resolve(false);
      });
  });
}

export { getAllUsers, getUser, addNewUser, deleteUser, patchUserRolesAndPermissions, editPassword };
