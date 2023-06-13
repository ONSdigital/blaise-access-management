import { requestPromiseJson, requestPromiseJsonList } from "./requestPromise";
import { UserRole } from "blaise-api-node-client";
import pino from "pino";

type getRolesListResponse = [boolean, UserRole[]];
const logger = pino();

function getAllRoles(): Promise<getRolesListResponse> {
    const url = "/api/roles";

    return new Promise((resolve: (object: getRolesListResponse) => void) => {
        requestPromiseJsonList("GET", url).then(([success, data]) => {
            console.log(`Response from get all roles ${(success ? "successful" : "failed")}, data list length ${data.length}`);
            resolve([success, data]);
        }).catch((error: Error) => {
            logger.error(`Response from get all roles API Failed: Error ${error}`);
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
            logger.info(`Response from add new role API: Status ${status}, data ${data}`);
            if (status === 201) {
                resolve(true);
            } else {
                resolve(false);
            }
        }).catch((error: Error) => {
            logger.error(`Add new role Failed: Error ${error}`);
            resolve(false);
        });
    });
}

export { getAllRoles, addNewRole };
