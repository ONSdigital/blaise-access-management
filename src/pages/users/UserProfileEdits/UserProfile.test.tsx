import React from "react";
import { render, cleanup, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, useParams } from "react-router-dom";
import UserProfile from "./UserProfile";
import * as http from "../../../api/http";

jest.mock("react-router-dom", () => ({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    ...jest.requireActual("react-router-dom"),
    useParams: jest.fn()
}));

jest.mock("../../../api/http", () => ({
    getUser: jest.fn()
}));

const mockUserDetails = {
    data: {
        name: "testUser",
        role: "IPS Manager",
        defaultServerPark: "gusty",
        serverParks: ["gusty", "cma"]
    },
    status: 200,
    message: "Successfully fetched user details for testUser"
};

const mockState = {
    pathname: `/users/${mockUserDetails.data.name}`,
    state: { currentUser: "currentUser", updatedPanel: null }
};

beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ user: mockUserDetails.data.name });
});

afterEach(() => cleanup());

describe("UserProfile Component", () => {
    it("matches the snapshot", async () => {
        (http.getUser as jest.Mock).mockResolvedValue(mockUserDetails);

        const { asFragment } = render(
            <MemoryRouter initialEntries={[mockState]}>
                <UserProfile />
            </MemoryRouter>
        );

        // Wait for state update
        await act(async () => {});

        await waitFor(() => {
            expect(asFragment()).toMatchSnapshot();
        });
    });

    it("displays user details on successful fetch", async () => {
        (http.getUser as jest.Mock).mockResolvedValue(mockUserDetails);

        const { findByText } = render(
            <MemoryRouter initialEntries={[mockState]}>
                <UserProfile />
            </MemoryRouter>
        );

        expect(await findByText(mockUserDetails.data.name)).toBeVisible();
        expect(await findByText(mockUserDetails.data.role)).toBeVisible();
        expect(await findByText(mockUserDetails.data.defaultServerPark)).toBeVisible();
        expect(await findByText(mockUserDetails.data.serverParks.join(", "))).toBeVisible();
    });

    it("displays error message on fetch failure", async () => {
        (http.getUser as jest.Mock).mockRejectedValue(new Error("Unable to load user details, please try again. If this continues, please the contact service desk."));

        const { findByText } = render(
            <MemoryRouter initialEntries={[mockState]}>
                <UserProfile />
            </MemoryRouter>
        );

        expect(await findByText(/Unable to load user details, please try again. If this continues, please the contact service desk./i)).toBeVisible();
    });
});