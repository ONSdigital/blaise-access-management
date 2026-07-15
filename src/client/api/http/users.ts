import {
  type GetUserResponse,
  type GetUsersListResponse,
  type PatchUserRoleResponse,
} from "../../types/usersApi.types";
import { clientLogger } from "../../utils/logger";

import { handleAxiosError } from "./errors";
import { type ApiResponse, fetchJson, fetchJsonList } from "./fetchJson";

import type { NewUser, User } from "blaise-api-node-client";

function toErrorResponse<TData>(error: unknown, fallbackData: TData): ApiResponse<TData> {
  const errorObj = handleAxiosError(error);

  clientLogger.error(errorObj.message, errorObj);

  return {
    success: false,
    status: errorObj.status,
    message: errorObj.message,
    error: errorObj.error,
    data: fallbackData,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUser(value: unknown): value is User {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.name === "string" &&
    typeof value.role === "string" &&
    Array.isArray(value.serverParks) &&
    typeof value.defaultServerPark === "string"
  );
}

function getNestedMessage(data: unknown, fallbackMessage: string): string {
  if (!isRecord(data) || typeof data.message !== "string") {
    return fallbackMessage;
  }

  return data.message;
}

function getNestedUser(data: unknown): User | Record<string, never> {
  if (!isRecord(data) || !isRecord(data.data)) {
    return {};
  }

  const candidate = data.data;

  if (isUser(candidate)) {
    return candidate;
  }

  return {};
}

async function getAllUsers(): Promise<GetUsersListResponse> {
  const url = "/api/users";

  try {
    return await fetchJsonList<User>("GET", url);
  } catch (error) {
    return toErrorResponse(error, []);
  }
}

async function getUser(user: string): Promise<GetUserResponse> {
  try {
    const url = `/api/users/${user}`;
    const response = await fetchJson("GET", url);

    return {
      success: response.success,
      status: response.status,
      message: getNestedMessage(response.data, response.message),
      data: getNestedUser(response.data),
      error: response.error,
    };
  } catch (error) {
    return toErrorResponse(error, {});
  }
}

async function addNewUser(newUser: NewUser): Promise<ApiResponse<Record<string, never>>> {
  const url = "/api/users";

  if (!newUser.password) {
    return {
      success: false,
      status: 400,
      message: "Password is required",
      data: {},
    };
  }

  const formData = new FormData();

  formData.append("name", newUser.name);
  formData.append("password", newUser.password);
  const roleName = typeof newUser.role === "string" ? newUser.role : newUser.role.name;

  formData.append("role", roleName);

  try {
    const response = await fetchJson("POST", url, formData);
    const success = response.status === 200 || response.status === 201;

    return {
      success,
      status: response.status,
      message: response.message,
      error: response.error,
      data: {},
    };
  } catch (error) {
    return toErrorResponse(error, {});
  }
}

async function deleteUser(username: string): Promise<ApiResponse<Record<string, never>>> {
  const url = "/api/users";

  const headers = {
    user: username,
  };

  try {
    const response = await fetchJson("DELETE", url, null, headers);

    return {
      success: response.status === 204,
      status: response.status,
      message: response.message,
      error: response.error,
      data: {},
    };
  } catch (error) {
    return toErrorResponse(error, {});
  }
}

async function patchUserRolesAndPermissions(
  user: string,
  role: string,
  previousRole: string,
): Promise<PatchUserRoleResponse> {
  try {
    const url = `/api/users/${user}/rolesAndPermissions`;
    const response = await fetchJson("PATCH", url, JSON.stringify({ role, previousRole }), {
      "Content-Type": "application/json",
    });

    return {
      success: response.success,
      status: response.status,
      message: getNestedMessage(response.data, response.message),
      data: {},
      error: response.error,
    };
  } catch (error) {
    return toErrorResponse(error, {});
  }
}

async function editPassword(
  username: string,
  newPassword: string,
): Promise<ApiResponse<Record<string, never>>> {
  const url = "/api/change-password/" + username;

  if (username === "" || newPassword === "") {
    return {
      success: false,
      status: 400,
      message: "Username and password are required",
      data: {},
    };
  }

  const formData = new FormData();

  formData.append("password", newPassword);

  try {
    const response = await fetchJson("POST", url, formData);

    return {
      success: response.status === 204,
      status: response.status,
      message: response.message,
      error: response.error,
      data: {},
    };
  } catch (error) {
    return toErrorResponse(error, {});
  }
}

export { getAllUsers, getUser, addNewUser, deleteUser, patchUserRolesAndPermissions, editPassword };
