import React from "react";
import {render, waitFor, cleanup, screen} from "@testing-library/react";
import "@testing-library/jest-dom";
import flushPromises, {mock_server_request_Return_JSON} from "../../tests/utils";
import {act} from "react-dom/test-utils";
import {createMemoryHistory} from "history";
import {Router} from "react-router";
import {Role} from "../../../Interfaces";
import Roles from "./Roles";

const roleList: Role[] = [
    {name: "DST", permissions: ["Admin", "Bacon.access"], description: "A role"},
    {name: "BDSS", permissions: ["Admin"], description: "Another role"}
];

describe("Manage Roles page", () => {

    beforeAll(() => {
        mock_server_request_Return_JSON(200, roleList);
    });

    it("view users page matches Snapshot", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <Roles/>
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });

    });

    it("should render correctly", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <Roles/>
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/Manage roles/i)).toBeDefined();
            expect(screen.getByText(/Create new role/i)).toBeDefined();
            expect(screen.getByText(/DST/i)).toBeDefined();
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
        mock_server_request_Return_JSON(200, {text: "Hello"});
    });

    it("it should render with the error message displayed", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <Roles/>
            </Router>
        );

        await act(async () => {
            await flushPromises();
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
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <Roles/>
            </Router>
        );

        await act(async () => {
            await flushPromises();
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
