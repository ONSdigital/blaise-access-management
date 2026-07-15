import type { ApiResponse } from "../api/http/fetchJson";
import type { User } from "blaise-api-node-client";

export type GetUserResponse = ApiResponse<User | Record<string, never>>;

export type PatchUserRoleResponse = ApiResponse<Record<string, never>>;

export type GetUsersListResponse = ApiResponse<User[]>;
