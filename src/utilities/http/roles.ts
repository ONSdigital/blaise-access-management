import {requestPromiseJson, requestPromiseJsonList} from "./requestPromise";
import {Role} from "../../../Interfaces";

type getRolesListResponse = [boolean, Role[]];

function getAllRoles(): Promise<getRolesListResponse> {
    console.log("Call to getAllRoles");
    const url = "/api/roles";

    return new Promise((resolve: (object: getRolesListResponse) => void) => {
        requestPromiseJsonList("GET", url).then(([success, data]) => {
            console.log(`Response from get all roles ${(success ? "successful" : "failed")}, data list length ${data.length}`);
            resolve([success, data]);
        }).catch((error: Error) => {
            console.error(`Response from get all roles Failed: Error ${error}`);
            resolve([false, []]);
        });
    });
}

function addNewRole(newRole: Role): Promise<boolean> {
    console.log("Call to addNewRole");

    const url = "/api/roles";

    return new Promise((resolve: (object: boolean) => void) => {

        const formData = new FormData();
        formData.append("name", newRole.name);
        formData.append("description", newRole.description);

        requestPromiseJson("POST", url, formData).then(([status, data]) => {
            console.log(`Response from add new role: Status ${status}, data ${data}`);
            if (status === 201) {
                resolve(true);
            } else {
                resolve(false);
            }
        }).catch((error: Error) => {
            console.error(`Response from add new role Failed: Error ${error}`);
            resolve(false);
        });
    });
}

export {getAllRoles, addNewRole};
