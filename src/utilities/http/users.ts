import { ImportUser } from "../../../Interfaces";
import {requestPromiseJson, requestPromiseJsonList} from "./requestPromise";
import {User, NewUser, UserRole} from "blaise-api-node-client";

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

function validateUsers(users: ImportUser[], validRoles: UserRole[]) {
    users.map((user) => {
        validateUser(user, validRoles);
    });
}

function validateUser(user: ImportUser, validRoles: UserRole[]) {
    user.valid = true;
    user.warnings = [];

    if (user.name === undefined || user.name === null) {
        user.valid = false;
        user.warnings.push("Invalid name");
    }

    if (user.password === undefined || user.password === null) {
        user.valid = false;
        user.warnings.push("Invalid password");
    }

    if (user.role === undefined || user.role === null) {
        user.warnings.push("Invalid role");
        user.valid = false;
    } else {
        const isValidRole = validRoles.some(function (el) {
            return el.name === user.role;
        });

        if (!isValidRole) {
            user.warnings.push("Not a valid role");
            user.valid = false;
        }
    }
}

export {getAllUsers, addNewUser, deleteUser, validateUsers, validateUser};
