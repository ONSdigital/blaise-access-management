// eslint-disable-next-line @typescript-eslint/ban-ts-comment
export function mock_server_request_Return_JSON(returnedStatus: number, returnedJSON: unknown): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch = jest.fn(() =>
        Promise.resolve({
            status: returnedStatus,
            json: () => Promise.resolve(returnedJSON)
        })
    );
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mock_server_request_function(mock_function: (input: RequestInfo | URL, init?: RequestInit) => Promise<any>): void {
    global.fetch = mock_function;
}