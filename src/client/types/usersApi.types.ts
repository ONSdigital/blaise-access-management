import type { User } from "blaise-api-node-client";

export interface GetUserResponse {
  status: number;
  message: string;
  data: User | Record<string, never>;
  error?: unknown;
}

export interface PatchUserRoleResponse {
  status: number;
  message: string;
  error?: unknown;
}

export type GetUsersListResponse = [boolean, User[]];
