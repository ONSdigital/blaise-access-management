import {requestPromiseJson, requestPromiseJsonList} from "./requestPromise";
import {User, NewUser} from "blaise-api-node-client";

type getUsersListResponse = [boolean, User[]];

function getAllUsers(): Promise<getUsersListResponse> {
    const url = "/api/users";

    return new Promise((resolve: (object: getUsersListResponse) => void) => {
        requestPromiseJsonList("GET", url).then(([success, data]) => {
            resolve([success, data]);
        }).catch((error: Error) => {
            console.error(error);
            resolve([false, []]);
        });
    });
}

function addNewUser(newUser: NewUser): Promise<boolean> {
    const url = "/api/users";

    return new Promise((resolve: (object: boolean) => void) => {

        if (newUser.password === undefined) {
            resolve(false);
            return;
        }

        const formData = new FormData();
        formData.append("name", newUser.name);
        formData.append("password", newUser.password);
        formData.append("role", newUser.role);

        requestPromiseJson("POST", url, formData).then(([status, data]) => {
            if (status === 200 || status === 201) {
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

function deleteUser(username: string): Promise<boolean> {
    const url = "/api/users";

    const headers = {
        "user": username
    };

    return new Promise((resolve: (object: boolean) => void) => {

        requestPromiseJson("DELETE", url, null, headers).then(([status, data]) => {
            if (status === 204) {
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

export {getAllUsers, addNewUser, deleteUser};
