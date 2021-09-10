type PromiseResponse = [number, any];

function requestPromiseJson(method: string, url: string, body: any = null, headers: any = {}): Promise<PromiseResponse> {
    return new Promise((resolve: (object: PromiseResponse) => void, reject: (error: string) => void) => {
        fetch(url, {
            "method": method,
            "body": body,
            "headers": headers
        })
            .then(async response => {
                response.json().then(
                    data => (resolve([response.status, data]))
                ).catch((error) => {
                    console.log(`Failed to read JSON from response, Error: ${error}`);
                    resolve([response.status, "Read JSON failed"]);
                });
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
    });
}


type PromiseResponseList = [boolean, []];

function requestPromiseJsonList(method: string, url: string, body: any = null): Promise<PromiseResponseList> {
    return new Promise((resolve: (object: PromiseResponseList) => void, reject: (error: string) => void) => {
        fetch(url, {
            "method": method,
            "body": body
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
                    console.log(`Failed to read JSON from response, Error: ${error}`);
                    resolve([false, []]);
                });
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
    });
}

export {requestPromiseJson, requestPromiseJsonList};
