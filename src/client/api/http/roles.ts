import { fetchJsonList, type FetchJsonListResponse } from "./fetchJson";

import type { UserRole } from "blaise-api-node-client";

type GetRolesListResponse = FetchJsonListResponse<UserRole>;

async function getAllRoles(): Promise<GetRolesListResponse> {
  const url = "/api/roles";

  return fetchJsonList<UserRole>("GET", url);
}

export { getAllRoles };
