import { fetchJson, fetchJsonList } from "./fetchJson";

import type { UserRole } from "blaise-api-node-client";

type getRolesListResponse = [boolean, UserRole[]];

async function getAllRoles(): Promise<getRolesListResponse> {
  try {
    const url = "/api/roles";
    const [success, data] = await fetchJsonList<UserRole>("GET", url);

    return [success, data] as getRolesListResponse;
  } catch {
    return [false, []] as getRolesListResponse;
  }
}

function addNewRole(newRole: UserRole): Promise<boolean> {
  const url = "/api/roles";

  return new Promise((resolve: (object: boolean) => void) => {
    const formData = new FormData();

    formData.append("name", newRole.name);
    formData.append("description", newRole.description);

    fetchJson("POST", url, formData)
      .then(([status]) => {
        if (status === 201) {
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

export { getAllRoles, addNewRole };
