import { requestPromiseJson, requestPromiseJsonList } from "./requestPromise";
import { User, NewUser } from "blaise-api-node-client";

type getUsersListResponse = [boolean, User[]];

async function getAllUsers(): Promise<getUsersListResponse> {
    try {
        const url = "/api/users";
        const [success, data] = await requestPromiseJsonList<User>("GET", url);
        return [success, data] as getUsersListResponse;
    } catch (error) {
        return [false, []] as getUsersListResponse;
    }
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

        requestPromiseJson("POST", url, formData).then(([status]) => {
            if (status === 200 || status === 201) {
                resolve(true);
            } else {
                resolve(false);
            }
        }).catch(() => {
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

        requestPromiseJson("DELETE", url, null, headers).then(([status]) => {
            if (status === 204) {
                resolve(true);
            } else {
                resolve(false);
            }
        }).catch(() => {
            resolve(false);
        });
    });
}

export { getAllUsers, addNewUser, deleteUser };
