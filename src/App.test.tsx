import React from "react";
import {render, waitFor, cleanup, screen} from "@testing-library/react";
import App from "./App";
import "@testing-library/jest-dom";
import {act} from "react-dom/test-utils";
import {createMemoryHistory} from "history";
import {Router} from "react-router";
import {AuthManager} from "blaise-login-react-client";
import * as loginReactClient from "blaise-login-react-client";

jest.mock("blaise-login-react-client");

AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

jest.spyOn(loginReactClient, "getCurrentUser").mockReturnValue(
    Promise.resolve({
        defaultServerPark: "gusty",
        name: "Blaise User",
        role: "DST",
        serverParks: ["gusty"]
    })
);

describe("React homepage", () => {
    it("the homepage matches Snapshot", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <App />
            </Router>
        );

        await act(async () => {
            await new Promise(process.nextTick);
        });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });

    });

    it("should render correctly", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <App />
            </Router>
        );
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
