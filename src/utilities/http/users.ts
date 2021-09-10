import {requestPromiseJson, requestPromiseJsonList} from "./requestPromise";
import {User} from "../../../Interfaces";

type getUsersListResponse = [boolean, User[]];

function getAllUsers(): Promise<getUsersListResponse> {
    console.log("Call to getAllUsers");
    const url = "/api/users";

    return new Promise((resolve: (object: getUsersListResponse) => void) => {
        requestPromiseJsonList("GET", url).then(([success, data]) => {
            console.log(`Response from get all users ${(success ? "successful" : "failed")}, data list length ${data.length}`);
            resolve([success, data]);
        }).catch((error: Error) => {
            console.error(`Response from get all users Failed: Error ${error}`);
            resolve([false, []]);
        });
    });
}

function addNewUser(newUser: User): Promise<boolean> {
    console.log("Call to addNewUser");

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
            console.log(`Response from add new user: Status ${status}, data ${data}`);
            if (status === 201) {
                resolve(true);
            } else {
                resolve(false);
            }
        }).catch((error: Error) => {
            console.error(`Response from add new user Failed: Error ${error}`);
            resolve(false);
        });
    });
}

function deleteUser(username: string): Promise<boolean> {
    console.log("Call to deleteUser");

    const url = "/api/users";

    const headers = {
        "user": username,
    };

    return new Promise((resolve: (object: boolean) => void) => {

        requestPromiseJson("DELETE", url, null, headers).then(([status, data]) => {
            console.log(`Response from add new user: Status ${status}, data ${data}`);
            if (status === 204) {
                resolve(true);
            } else {
                resolve(false);
            }
        }).catch((error: Error) => {
            console.error(`Response from add new user Failed: Error ${error}`);
            resolve(false);
        });
    });
}

export {getAllUsers, addNewUser, deleteUser};
