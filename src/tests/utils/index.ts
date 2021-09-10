// eslint-disable-next-line @typescript-eslint/ban-ts-comment

import { fireEvent, screen } from "@testing-library/dom";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const flushPromises = () => new Promise(setTimeout);

export function mock_server_request_Return_JSON(returnedStatus: number, returnedJSON: unknown) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch = jest.fn(() =>
        Promise.resolve({
            status: returnedStatus,
            json: () => Promise.resolve(returnedJSON),
        })
    );
}

export function mock_server_request_function(mock_function: any) {
    global.fetch = mock_function();
}

export default () => flushPromises().then(flushPromises);

export function loginUser(): void {
    fireEvent.input(screen.getByLabelText(/Username/i), {
        target: {
            value:
                "Blaise"
        }
    });
    fireEvent.input(screen.getByLabelText("Password"), {
        target: {
            value:
                "password"
        }
    });

    fireEvent.click(screen.getByTestId(/sign-in-button/i));
}
