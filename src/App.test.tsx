import React from "react";
import { render, waitFor, cleanup, screen } from "@testing-library/react";
import App from "./App";
import "@testing-library/jest-dom";
import { act } from "react-dom/test-utils";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";
import { User } from "blaise-api-node-client";
import { BrowserRouter } from "react-router-dom";

jest.mock("blaise-login-react/blaise-login-react-client");
const { MockAuthenticate } = jest.requireActual("blaise-login-react/blaise-login-react-client");
Authenticate.prototype.render = MockAuthenticate.prototype.render;

const userMockObject: User = {
    name: "Jake Bullet",
    role: "Manager",
    serverParks: ["gusty"],
    defaultServerPark: "gusty"
};

const user = userMockObject;

describe("React homepage", () => {
    beforeEach(() => {
        MockAuthenticate.OverrideReturnValues(user, true);
    });

    it("the homepage matches Snapshot", async () => {
        const wrapper = render(<App />, { wrapper: BrowserRouter });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });
    });

    it("should render correctly", async () => {
        render(<App />, { wrapper: BrowserRouter });

        expect(screen.getByText(/Blaise Access Management/i)).toBeDefined();

        await act(async () => {
            await new Promise(process.nextTick);
        });

        await waitFor(() => {
            expect(screen.getByText(/Blaise Access Management/i)).toBeDefined();
            expect(screen.queryAllByText(/Manage users/i)).toBeDefined();
            expect(screen.queryAllByText(/Manage roles/i)).toBeDefined();
            expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
