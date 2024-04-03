import React from "react";
import { render, waitFor, cleanup, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { act } from "react-dom/test-utils";
import { User } from "blaise-api-node-client";
import Users from "./Users";
import { mock_server_request_Return_JSON } from "../../tests/utils";
import { BrowserRouter } from "react-router-dom";

const signedInUser: User = {
    defaultServerPark: "gusty",
    name: "TestUser123",
    role: "DST",
    serverParks: ["gusty"]
};

const userList: User[] = [
    { defaultServerPark: "gusty", name: "TestUser123", role: "DST", serverParks: ["gusty"] },
    { defaultServerPark: "gusty", name: "SecondUser", role: "BDSS", serverParks: ["gusty"] }
];

describe("Manage Users page", () => {

    beforeAll(() => {
        mock_server_request_Return_JSON(200, userList);
    });

    it("view users page matches Snapshot", async () => {
        const wrapper = render(<Users currentUser={signedInUser} />, { wrapper: BrowserRouter });

        await act(async () => {
            await new Promise(process.nextTick);
        });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });

    });

    it("should render correctly", async () => {
        render(<Users currentUser={signedInUser} />, { wrapper: BrowserRouter });

        await act(async () => {
            await new Promise(process.nextTick);
        });

        await waitFor(() => {
            expect(screen.getByText(/Manage users/i)).toBeDefined();
            expect(screen.getByText(/Create new user/i)).toBeDefined();
            expect(screen.getByText(/TestUser123/i)).toBeDefined();
            expect(screen.getByText(/SecondUser/i)).toBeDefined();
            expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("Given the API returns malformed json", () => {

    beforeAll(() => {
        mock_server_request_Return_JSON(200, { text: "Hello" });
    });

    it("it should render with the error message displayed", async () => {
        render(<Users currentUser={signedInUser} />, { wrapper: BrowserRouter });

        await act(async () => {
            await new Promise(process.nextTick);
        });

        await waitFor(() => {
            expect(screen.getByText(/Sorry, there is a problem with this service. We are working to fix the problem. Please try again later./i)).toBeDefined();
            expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
        });

    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("Given the API returns an empty list", () => {

    beforeAll(() => {
        mock_server_request_Return_JSON(200, []);
    });

    it("it should render with a message to inform the user in the list", async () => {
        render(<Users currentUser={signedInUser} />, { wrapper: BrowserRouter });

        await act(async () => {
            await new Promise(process.nextTick);
        });

        await waitFor(() => {
            expect(screen.getByText(/No installed users found./i)).toBeDefined();
            expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
        });

    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
