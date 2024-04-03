import React from "react";
import { render, waitFor, cleanup, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { mock_server_request_Return_JSON } from "../../tests/utils";
import { act } from "react-dom/test-utils";
import { UserRole } from "blaise-api-node-client";
import Roles from "./Roles";
import { BrowserRouter } from "react-router-dom";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";

jest.mock("blaise-login-react/blaise-login-react-client");
const { MockAuthenticate } = jest.requireActual("blaise-login-react/blaise-login-react-client");
Authenticate.prototype.render = MockAuthenticate.prototype.render;

const roleList: UserRole[] = [
    { name: "DST", permissions: ["Admin", "Bacon.access"], description: "A role" },
    { name: "BDSS", permissions: ["Admin"], description: "Another role" }
];

describe("Manage Roles page", () => {

    beforeAll(() => {
        MockAuthenticate.OverrideReturnValues(null, true);
        mock_server_request_Return_JSON(200, roleList);
    });

    it("view users page matches Snapshot", async () => {
        const wrapper = render(<Roles />, { wrapper: BrowserRouter });

        await act(async () => {
            await new Promise(process.nextTick);
        });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });

    });

    it("should render correctly", async () => {
        render(<Roles />, { wrapper: BrowserRouter });

        await act(async () => {
            await new Promise(process.nextTick);
        });

        await waitFor(() => {
            expect(screen.getByText(/DST are responsible for creating and managing roles/i)).toBeDefined();
            expect(screen.getByText(/Manage roles/i)).toBeDefined();
            expect(screen.getAllByText(/DST/i).length).toBeGreaterThan(1);
            expect(screen.getByText(/BDSS/i)).toBeDefined();
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
        MockAuthenticate.OverrideReturnValues(null, true);
        mock_server_request_Return_JSON(200, { text: "Hello" });
    });

    it("it should render with the error message displayed", async () => {
        render(<Roles />, { wrapper: BrowserRouter });

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
        MockAuthenticate.OverrideReturnValues(null, true);
        mock_server_request_Return_JSON(200, []);
    });

    it("it should render with a message to inform the user in the list", async () => {
        render(<Roles />, { wrapper: BrowserRouter });

        await act(async () => {
            await new Promise(process.nextTick);
        });

        await waitFor(() => {
            expect(screen.getByText(/No installed roles found./i)).toBeDefined();
            expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
        });

    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
