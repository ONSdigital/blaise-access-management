import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes, useParams } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import ChangePassword from "./ChangePassword";
import { editPassword } from "../../../api/http/users";
import { AuthManager } from "blaise-login-react/blaise-login-react-client";
import UserProfile from "./UserProfile";

jest.mock("react-router-dom", () => ({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    ...jest.requireActual("react-router-dom"),
    useParams: jest.fn()
}));

jest.mock("blaise-login-react/blaise-login-react-client", () => ({
    AuthManager: jest.fn().mockImplementation(() => ({
        authHeader: () => ({
            Authorization: process.env.MOCK_AUTH_TOKEN
        })
    }))
}));

jest.mock("../../../api/http/users", () => ({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    ...jest.requireActual("../../../api/http/users"),
    editPassword: jest.fn()
}));

const mockUserDetails = {
    name: "testUser"
};

const mockState = {
    pathname: `/users/${mockUserDetails.name}/change-password`,
    state: { currentUser: "currentUser" }
};

beforeEach(() => {
    (editPassword as jest.Mock).mockClear();
    (useParams as jest.Mock).mockReturnValue({ user: mockUserDetails.name });
});

afterEach(() => {
    jest.clearAllMocks();
    cleanup();
});

describe("ChangePassword Component", () => {
    it("matches the snapshot", async () => {
        const { asFragment } = render(
            <MemoryRouter initialEntries={[mockState]}>
                <ChangePassword />
            </MemoryRouter>
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("displays error message when passwords are empty", async () => {
        const { findByText, getByLabelText, getByText } = render(
            <MemoryRouter initialEntries={[mockState]}>
                <ChangePassword />
            </MemoryRouter>
        );

        const newPasswordInput = getByLabelText("New password");
        const confirmPasswordInput = getByLabelText("Confirm password");
        const saveButton = getByText("Save");

        act(() => {
            userEvent.type(newPasswordInput, "");
            userEvent.type(confirmPasswordInput, "");
            userEvent.click(saveButton);
        });

        expect(await findByText(/Passwords cannot be blank/i)).toBeVisible();
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
            userEvent.type(confirmPasswordInput, "password321333");
            userEvent.click(saveButton);
        });

        expect(await findByText(/Passwords do not match/i)).toBeVisible();
    });

    it("calls editPassword function with correct parameters upon form submission with correct username and password without any trailing whitespaces", async () => {
        const { getByLabelText, getByText } = render(
            <MemoryRouter initialEntries={[mockState]}>
                <ChangePassword />
            </MemoryRouter>
        );

        const newPasswordInput = getByLabelText("New password");
        const confirmPasswordInput = getByLabelText("Confirm password");
        const saveButton = getByText("Save");

        // Wait for state update
        act(() => {
            userEvent.type(newPasswordInput, "password123  ");
            userEvent.type(confirmPasswordInput, "password123       ");
            userEvent.click(saveButton);
        });

        expect(editPassword).toHaveBeenCalledWith("testUser", "password123");
    });

    it("calls editPassword function with correct parameters upon form submission with correct username and password", async () => {
        const { getByLabelText, getByText, findByText } = render(
            <MemoryRouter initialEntries={[mockState]}>
                <ChangePassword />
            </MemoryRouter>
        );

        const newPasswordInput = getByLabelText("New password");
        const confirmPasswordInput = getByLabelText("Confirm password");
        const saveButton = getByText("Save");

        // Wait for state update
        act(() => {
            userEvent.type(newPasswordInput, "password123");
            userEvent.type(confirmPasswordInput, "password123");
            userEvent.click(saveButton);
        });

        const url = "/api/change-password/testUser";
        const authManager = new AuthManager();
        const headers = authManager.authHeader();
        const formData = new FormData();
        formData.append("password", "password123");

        expect(editPassword).toHaveBeenCalledWith("testUser", "password123");
    });

    it("displays error message if the function returns false", async () => {
        const { getByLabelText, getByText, findByText } = render(
            <MemoryRouter initialEntries={[mockState]}>
                <ChangePassword />
            </MemoryRouter>
        );

        const newPasswordInput = getByLabelText("New password");
        const confirmPasswordInput = getByLabelText("Confirm password");
        const saveButton = getByText("Save");

        (editPassword as jest.Mock).mockResolvedValue(false);
        act(() => {
            userEvent.type(newPasswordInput, "password123");
            userEvent.type(confirmPasswordInput, "password123");
            userEvent.click(saveButton);
        });

        expect(editPassword).toHaveBeenCalledWith("testUser", "password123");
        expect(await findByText(/Set password failed/i)).toBeVisible();
    });

    it("displays success message if the function returns true", async () => {

        const initalPath = `/users/${mockUserDetails.name}/change-password`;
        const destinationPath = `/users/${mockUserDetails.name}`;

        const { getByLabelText, getByText, findByText } = render(
            <MemoryRouter initialEntries={[mockState]}>
                <Routes>
                    <Route
                        path={initalPath}
                        element={<ChangePassword />}
                    />
                    <Route
                        path={destinationPath}
                        element={
                            <UserProfile />
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        const newPasswordInput = getByLabelText("New password");
        const confirmPasswordInput = getByLabelText("Confirm password");
        const saveButton = getByText("Save");

        (editPassword as jest.Mock).mockResolvedValue(true);
        act(() => {
            userEvent.type(newPasswordInput, "password123");
            userEvent.type(confirmPasswordInput, "password123");
            userEvent.click(saveButton);
        });
        expect(await findByText(/Loading/i)).toBeVisible();
        expect(editPassword).toHaveBeenCalledWith("testUser", "password123");
        expect(screen.getByText("Password successfully changed for user called testUser")).toBeInTheDocument();
    });

});