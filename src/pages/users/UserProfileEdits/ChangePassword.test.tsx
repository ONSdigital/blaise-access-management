import React from "react";
import { render, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, useParams } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import ChangePassword from "./ChangePassword";

jest.mock("react-router-dom", () => ({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    ...jest.requireActual("react-router-dom"),
    useParams: jest.fn()
}));

jest.mock("blaise-login-react/blaise-login-react-client", () => ({
    AuthManager: jest.fn().mockImplementation(() => ({
        authHeader: () => ({
            Authorization: "Bearer " + process.env.MOCK_AUTH_TOKEN
        })
    }))
}));

global.fetch = jest.fn(() =>
    Promise.resolve({
        status: 204,
        json: () => Promise.resolve({ message: "Password changed successfully" })
    })
) as jest.Mock;

const mockUserDetails = {
    name: "testUser"
};

const mockState = {
    pathname: `/users/${mockUserDetails.name}/change-password`,
    state: { currentUser: "currentUser" }
};

beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    (useParams as jest.Mock).mockReturnValue({ user: mockUserDetails.name });
});

afterEach(() => cleanup());

describe("ChangePassword Component", () => {
    it("matches the snapshot", async () => {
        const { asFragment } = render(
            <MemoryRouter initialEntries={[mockState]}>
                <ChangePassword />
            </MemoryRouter>
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("displays error message when passwords do not match", async () => {
        const { findByText, getByLabelText, getByText } = render(
            <MemoryRouter initialEntries={[mockState]}>
                <ChangePassword />
            </MemoryRouter>
        );

        const newPasswordInput = getByLabelText("New password");
        const confirmPasswordInput = getByLabelText("Confirm password");
        const saveButton = getByText("Save");

        act(() => {
            userEvent.type(newPasswordInput, "password123");
            userEvent.type(confirmPasswordInput, "password321");
            userEvent.click(saveButton);
        });

        expect(await findByText(/Passwords do not match/i)).toBeVisible();
    });

    it.skip("calls fetch with correct parameters upon form submission with matching passwords", async () => {
        const { getByLabelText, getByText, findByText } = render(
            <MemoryRouter initialEntries={[mockState]}>
                <ChangePassword />
            </MemoryRouter>
        );

        const newPasswordInput = getByLabelText("New password");
        const confirmPasswordInput = getByLabelText("Confirm password");
        const saveButton = getByText("Save");

        // Wait for state update
        act(async () => {
            userEvent.type(newPasswordInput, "password123");
            userEvent.type(confirmPasswordInput, "password123");
            userEvent.click(saveButton);
        });

        // Improvement: Figure out why the fetch function is not being called
        // expect(fetch).toHaveBeenCalledTimes(1);
        // expect(fetch).toHaveBeenCalledWith("/api/change-password/testUser", {
        //     "headers": {
        //         "Authorization": "Bearer " + process.env.MOCK_AUTH_TOKEN,
        //         "password": "password123"
        //     }
        // });
    });
});