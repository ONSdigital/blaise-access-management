import {requestPromiseJson} from "./requestPromise";
import {User} from "../../../Interfaces";

type authLoginUserResponse = [boolean, User | null];

function loginUser(username: string, password: string): Promise<authLoginUserResponse> {
    console.log(`Call to login user with user ${username}`);
    const url = `/api/login/${username}`;

    const headers = {
        "password": password,
    };

    return new Promise((resolve: (object: authLoginUserResponse) => void) => {
        requestPromiseJson("GET", url, null, headers).then(([status, data]) => {
            console.log(`Response from login user: Status ${status}, data ${data}`);
            if (status === 200) {
                resolve([true, data]);
            } else if (status === 403) {
                resolve([true, null]);
            } else {
                resolve([false, null]);
            }
        }).catch((error: Error) => {
            console.error(`Response from login user Failed: Error ${error}`);
            resolve([false, null]);
        });
    });
}

export {loginUser};
