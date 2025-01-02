import axios from "axios";
import { requestPromiseJson, requestPromiseJsonList } from "./requestPromise";
import { User, NewUser } from "blaise-api-node-client";
import { AuthManager } from "blaise-login-react/blaise-login-react-client";
import { GetUserResponse, GetUsersListResponse, PatchUserRoleResponse } from "../../Interfaces/usersPage";
import { handleAxiosError } from ".";

async function getAllUsers(): Promise<GetUsersListResponse> {
    try {
        const url = "/api/users";
        const [success, data] = await requestPromiseJsonList<User>("GET", url);
        return [success, data] as GetUsersListResponse;
    } catch (error) {
        return [false, []] as GetUsersListResponse;
    }
}

async function getUser(user: string): Promise<GetUserResponse> {
    try {
        const authManager = new AuthManager();
        const url = `/api/users/${user}`;
        const headers = authManager.authHeader();

        const res = await axios.get(url, { headers });

        return {
            status: res.status,
            message: res.data.message,
            data: res.data.data
        };

    } catch (error) {
        const errorObj = handleAxiosError(error);
        console.error(errorObj.message, { ...errorObj, data: {}, error: error });
        throw Error(errorObj.message);
    }
}

function addNewUser(newUser: NewUser): Promise<boolean> {
    const url = "/api/users";

    return new Promise((resolve: (object: boolean) => void) => {

        if (!newUser.password) {
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

// BLAIS5-3816
async function patchUserRolesAndPermissions(user: string, role: string): Promise<PatchUserRoleResponse> {
    try {
        const authManager = new AuthManager();
        const url = `/api/users/${user}/rolesAndPermissions`;
        const headers = authManager.authHeader();
        const data = { role };

        const res = await axios.patch(url, data, { headers });

        return {
            status: res.status,
            message: res.data.message
        };
    } catch (error) {
        const errorObj = handleAxiosError(error);
        console.error(errorObj.message, errorObj);
        return errorObj;
    }
}

function editPassword(username: string, newPassword: string): Promise<boolean> {
    const url = "/api/change-password/" + username;
    const authManager = new AuthManager();
    const headers = authManager.authHeader();
    return new Promise((resolve: (object: boolean) => void) => {

        if (username == "" || username == undefined || newPassword == "" || newPassword == undefined) {
            resolve(false);
            return;
        }

        const formData = new FormData();
        formData.append("password", newPassword);

        requestPromiseJson("POST", url, formData, headers).then(([status]) => {
            if (status === 204)
                resolve(true);
            resolve(false);

        }).catch(() => {
            resolve(false);
        });
    });
}

export { getAllUsers, getUser, addNewUser, deleteUser, patchUserRolesAndPermissions, editPassword };
