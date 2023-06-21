import {requestPromiseJson, requestPromiseJsonList} from "./requestPromise";
import {UserRole} from "blaise-api-node-client";

type getRolesListResponse = [boolean, UserRole[]];

function getAllRoles(): Promise<getRolesListResponse> {
    const url = "/api/roles";

    return new Promise((resolve: (object: getRolesListResponse) => void) => {
        requestPromiseJsonList("GET", url).then(([success, data]) => {
            resolve([success, data]);
        }).catch((error: Error) => {
            console.error(error);
            resolve([false, []]);
        });
    });
}

function addNewRole(newRole: UserRole): Promise<boolean> {
    const url = "/api/roles";

    return new Promise((resolve: (object: boolean) => void) => {

        const formData = new FormData();
        formData.append("name", newRole.name);
        formData.append("description", newRole.description);

        requestPromiseJson("POST", url, formData).then(([status, data]) => {
            if (status === 201) {
                resolve(true);
            } else {
                resolve(false);
            }
        }).catch((error: Error) => {
            console.error(error);
            resolve(false);
        });
    });
}

export {getAllRoles, addNewRole};
