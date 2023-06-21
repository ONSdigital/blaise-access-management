import {AuthManager} from "blaise-login-react-client";

type PromiseResponse = [number, any];

function requestPromiseJson(method: string, url: string, body: any = null, headers: any = {}): Promise<PromiseResponse> {
    const authManager = new AuthManager();

    return new Promise((resolve: (object: PromiseResponse) => void, reject: (error: string) => void) => {
        fetch(url, {
            "method": method,
            "body": body,
            "headers": Object.assign({}, headers, authManager.authHeader())
        })
            .then(async response => {
                response.json().then(
                    data => (resolve([response.status, data]))
                ).catch((error) => {
                    resolve([response.status, "Read JSON failed"]);
                });
            })
            .catch(err => {
                console.error(err);
                reject(err);
            });
    });
}

type PromiseResponseList = [boolean, []];

function requestPromiseJsonList(method: string, url: string, body: any = null): Promise<PromiseResponseList> {
    const authManager = new AuthManager();
    return new Promise((resolve: (object: PromiseResponseList) => void, reject: (error: string) => void) => {
        fetch(url, {
            "method": method,
            "body": body,
            "headers": authManager.authHeader()
        })
            .then(async response => {
                response.json().then(
                    data => {
                        if (response.status === 200) {
                            if (!Array.isArray(data)) {
                                resolve([false, []]);
                            }
                            resolve([true, data]);
                        } else if (response.status === 404) {
                            resolve([true, data]);
                        } else {
                            resolve([false, []]);
                        }
                    }
                ).catch((error) => {
                    console.error(error);
                    resolve([false, []]);
                });
            })
            .catch(err => {
                reject(err);
            });
    });
}

export {requestPromiseJson, requestPromiseJsonList};
