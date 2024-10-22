/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, cleanup, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ChangeRole from "./ChangeRole";
import { MemoryRouter, useParams } from "react-router-dom";
import { getAllRoles, patchUserRolesAndPermissions } from "../../../api/http";
import userEvent from "@testing-library/user-event";
import { UserRole } from "blaise-api-node-client";

jest.mock("react-router-dom", () => ({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    ...jest.requireActual("react-router-dom"),
    useParams: jest.fn()
}));

jest.mock("../../../api/http", () => ({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    ...jest.requireActual("../../../api/http"),
    getAllRoles: jest.fn(),
    patchUserRolesAndPermissions: jest.fn()
}));

const mockRoles = [
    { name: "DST", description: "DST User" },
    { name: "BDSS", description: "BDSS User" },
    { name: "IPS Manager", description: "IPS Field Interviewer User" },
    { name: "IPS Field Interviewer", description: "IPS Manager User" },
    { name: "IPS Researcher", description: "IPS Researcher User" },
    { name: "Editor", description: "Editor User" },
    { name: "Editor Manager", description: "Editor Manager User" },
    { name: "TO Appointments", description: "TO Appointments User" },
    { name: "TO Manager", description: "TO Manager User" },
    { name: "TO Interviewer", description: "TO Interviewer User" },
    { name: "SEL", description: "SEL User" },
    { name: "Welsh Speaker", description: "Welsh Speaker User" }
];

const mockUserDetails = {
    data: { role: "DST" },
    name: "testUser",
    role: "DST",
    serverParks: ["gusty"],
    defaultServerPark: "gusty"
};

const mockState = {
    pathname: `users/${mockUserDetails.name}/change-role`,
    state: { currentUser: "currentUser", viewedUserDetails: mockUserDetails }
};

beforeEach(() => {
    (getAllRoles as jest.Mock).mockResolvedValue([true, mockRoles]);
    (useParams as jest.Mock).mockReturnValue({ user: mockUserDetails.name });
});

afterEach(() => cleanup());

describe("ChangeRole Component (with state management)", () => {
    it("matches the snapshot", async () => {
        (patchUserRolesAndPermissions as unknown as jest.Mock).mockResolvedValue({ message: "Role updated successfully", status: 200 });

        const { asFragment } = render(
            <MemoryRouter initialEntries={[mockState]}>
                <ChangeRole />
            </MemoryRouter>
        );

        // Wait for state update
        await act(async () => {});

        expect(asFragment()).toMatchSnapshot();
    });

    it("renders and displays the correct initial role", async () => {
        const { findByText, findAllByText } = render(
            <MemoryRouter initialEntries={[mockState]}>
                <ChangeRole />
            </MemoryRouter>
        );

        // Wait for state update
        await act(async () => {});

        expect(await findByText(/Current role:/i)).toBeVisible();
        expect((await findAllByText(/DST/i))[0]).toBeVisible();
    });

    it("updates role upon form submission", async () => {
        global.confirm = jest.fn(() => true);

        const { findByText, findByRole } = render(
            <MemoryRouter initialEntries={[mockState]}>
                <ChangeRole />
            </MemoryRouter>
        );

        // Wait for state update
        await act(async () => {});

        const select = await findByRole("combobox");
        const saveButton = await findByText("Save");

        act(() => {
            userEvent.selectOptions(select, ["IPS Field Interviewer"]);
        });

        expect(await findByText(/IPS Field Interviewer/i)).toBeVisible();

        act(() => {
            userEvent.click(saveButton);
        });

        // Wait for state update
        await act(async () => {});

        expect(patchUserRolesAndPermissions).toHaveBeenCalledTimes(1);
        expect(patchUserRolesAndPermissions).toHaveBeenCalledWith("testUser", "IPS Field Interviewer");
    });

    it("displays an error message when fetching roles fails", async () => {
        (getAllRoles as jest.Mock).mockRejectedValue(new Error("Failed to fetch roles"));

        const { findByText } = render(
            <MemoryRouter initialEntries={[mockState]}>
                <ChangeRole />
            </MemoryRouter>
        );

        // Wait for state update
        await act(async () => {});

        expect(await findByText(/Failed to fetch roles list, please try again/i)).toBeVisible();
    });
});
