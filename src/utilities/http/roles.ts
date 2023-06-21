import {requestPromiseJson, requestPromiseJsonList} from "./requestPromise";
import {UserRole} from "blaise-api-node-client";

type getRolesListResponse = [boolean, UserRole[]];

async function getAllRoles(): Promise<getRolesListResponse> {
  try {
    const url = "/api/roles";
    const [success, data] = await requestPromiseJsonList<UserRole>("GET", url);
    return [success, data] as getRolesListResponse;
  } catch (error) {
    return [false, []] as getRolesListResponse;
  }
}

function addNewRole(newRole: UserRole): Promise<boolean> {
    const url = "/api/roles";

    return new Promise((resolve: (object: boolean) => void) => {

        const formData = new FormData();
        formData.append("name", newRole.name);
        formData.append("description", newRole.description);

        requestPromiseJson("POST", url, formData).then(([status]) => {
            if (status === 201) {
                resolve(true);
            } else {
                resolve(false);
            }
        }).catch(() => {
            resolve(false);
        });
    });
}

export {getAllRoles, addNewRole};
