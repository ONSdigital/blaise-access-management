/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, cleanup, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ChangeRole from "./ChangeRole";
import { MemoryRouter, useParams } from "react-router-dom";
import { getAllRoles, patchUserRolesAndPermissions } from "../../../api/http";
import { ValidUserRoles } from "../../../Interfaces";
import userEvent from "@testing-library/user-event";

jest.mock("react-router-dom", () => ({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    ...jest.requireActual("react-router-dom"),
    useParams: jest.fn()
}));

jest.mock("../../../api/http", () => ({
    getAllRoles: jest.fn(),
    patchUserRolesAndPermissions: jest.fn()
}));

const mockRoles = [
    { name: ValidUserRoles.DST, description: "DST User" },
    { name: ValidUserRoles.BDSS, description: "BDSS User" },
    { name: ValidUserRoles.IPSFieldInterviewer, description: "IPS Field Interviewer User" },
    { name: ValidUserRoles.IPSManager, description: "IPS Manager User" },
    { name: ValidUserRoles.Editor, description: "Editor User" },
    { name: ValidUserRoles.EditorManager, description: "Editor Manager User" },
    { name: ValidUserRoles.TOAppointments, description: "TO Appointments User" },
    { name: ValidUserRoles.TOManager, description: "TO Manager User" },
    { name: ValidUserRoles.TOInterviewer, description: "TO Interviewer User" },
    { name: ValidUserRoles.SEL, description: "SEL User" },
    { name: ValidUserRoles.WelshSpeaker, description: "Welsh Speaker User" }
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
    (getAllRoles as unknown as jest.Mock).mockResolvedValue([true, mockRoles]);
    (useParams as jest.Mock).mockReturnValue({ user: mockUserDetails.name });
});

afterEach(() => cleanup());

describe("ChangeRole Component", () => {
    it("matches the snapshot", async () => {
        (patchUserRolesAndPermissions as unknown as jest.Mock).mockResolvedValue({ message: "Role updated successfully", status: 200 });

        const { asFragment } = render(
            <MemoryRouter initialEntries={[mockState]}>
                <ChangeRole />
            </MemoryRouter>
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("renders and displays the correct initial role", async () => {
        (patchUserRolesAndPermissions as unknown as jest.Mock).mockResolvedValue({ message: "Role updated successfully", status: 200 });

        const { findByText, findAllByText } = render(
            <MemoryRouter initialEntries={[mockState]}>
                <ChangeRole />
            </MemoryRouter>
        );

        expect(await findByText(/Current role:/i)).toBeVisible();
        expect((await findAllByText(/DST/i))[0]).toBeVisible();
    });

    it("updates role upon form submission", async () => {
        (patchUserRolesAndPermissions as unknown as jest.Mock).mockResolvedValue({ message: "Role updated successfully", status: 200 });
        global.confirm = jest.fn(() => true);

        const { findByText, findByRole } = render(
            <MemoryRouter initialEntries={[mockState]}>
                <ChangeRole />
            </MemoryRouter>
        );

        const select = await findByRole("combobox");
        const saveButton = await findByText("Save");

        act(() => {
            userEvent.selectOptions(select, ["IPS Field Interviewer"]);
        });

        expect(await findByText(/IPS Field Interviewer/i)).toBeVisible();

        act(() => {
            userEvent.click(saveButton);
        });
        expect(patchUserRolesAndPermissions).toHaveBeenCalledTimes(1);

        // Improvement: Ensure the user from the pathname is extracted and used to call the function
        // expect(patchUserRolesAndPermissions).toHaveBeenCalledWith("testUser", "IPS Field Interviewer", ["gusty"], "gusty");
    });
});