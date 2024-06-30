import React from "react";
import { render, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserProfile from "./UserProfile";
import { MemoryRouter } from "react-router-dom";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";
import { isLoading, hasErrored, useAsyncRequest } from "../../../hooks/useAsyncRequest";

jest.mock("blaise-login-react/blaise-login-react-client");
const { MockAuthenticate } = jest.requireActual("blaise-login-react/blaise-login-react-client");
Authenticate.prototype.render = MockAuthenticate.prototype.render;

jest.mock("../../../hooks/useAsyncRequest", () => ({
    useAsyncRequest: jest.fn(),
    isLoading: jest.fn(),
    hasErrored: jest.fn()
}));

jest.mock("../../../api/http", () => ({
    getUser: jest.fn()
}));

const mockUserDetails = {
    name: "testUser",
    role: "DST",
    serverParks: ["gusty"],
    defaultServerPark: "gusty"
};

const mockState = {
    pathname: `/users/${mockUserDetails.name}`,
    state: { currentUser: mockUserDetails, updatedPanel: null }
};

beforeEach(() => {
    (isLoading as unknown as jest.Mock).mockImplementation(() => false);
    (hasErrored as unknown as jest.Mock).mockImplementation(() => false);
    (useAsyncRequest as jest.Mock).mockResolvedValue({
        data: { ...mockUserDetails },
        state: "succeeded"
    });
});

afterEach(() => cleanup());

describe("UserProfile Component", () => {
    beforeAll(() => {
        MockAuthenticate.OverrideReturnValues(mockUserDetails, true);
    });

    it("should render correctly and match the snapshot", async () => {
        const { asFragment, findByText } = render(
            <MemoryRouter initialEntries={[mockState]}>
                <UserProfile />
            </MemoryRouter>
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("renders user profile details", async () => {
        const { findByText, findAllByText } = render(
            <MemoryRouter initialEntries={[mockState]}>
                <UserProfile />
            </MemoryRouter>
        );

        expect(await findByText(/Name/i)).toBeVisible();
        expect((await findAllByText(/Role/i))[0]).toBeVisible();
        expect(await findByText(/Default Server Park/i)).toBeVisible();
        expect(await findByText(/Server Parks/i)).toBeVisible();
    });

    it("displays updated panel if present", async () => {
        const updatedState = {
            ...mockState,
            state: { ...mockState.state, updatedPanel: { visible: true, status: "success", message: "User updated successfully" } }
        };

        const { findByText } = render(
            <MemoryRouter initialEntries={[updatedState]}>
                <UserProfile />
            </MemoryRouter>
        );

        expect(await findByText("User updated successfully")).toBeVisible();
    });
});