/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, cleanup, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DeleteUser from "./DeleteUser";
import { MemoryRouter, useParams } from "react-router-dom";
import { deleteUser } from "../../../api/http";

jest.mock("react-router-dom", () => ({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    ...jest.requireActual("react-router-dom"),
    useParams: jest.fn()
}));

jest.mock("../../../api/http", () => ({
    deleteUser: jest.fn()
}));

const mockUser = "testUser";

beforeEach(() => {
    (useParams as jest.Mock).mockReturnValue({ user: mockUser });
});

afterEach(() => cleanup());

describe("DeleteUser Component", () => {
    it("matches the snapshot", () => {
        const { asFragment } = render(
            <MemoryRouter>
                <DeleteUser />
            </MemoryRouter>
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("successfully deletes a user", async () => {
        (deleteUser as jest.Mock).mockResolvedValue(true);

        const { getByText, getByLabelText } = render(
            <MemoryRouter>
                <DeleteUser />
            </MemoryRouter>
        );

        fireEvent.click(getByLabelText("Yes"));
        fireEvent.click(getByText("Save"));

        await waitFor(() => {
            expect(deleteUser).toHaveBeenCalledWith(mockUser);
        });
    });
});