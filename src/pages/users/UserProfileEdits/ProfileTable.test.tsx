import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import ProfileTable from "./ProfileTable";

const currentUser = {
    name: "CurrentUser",
    role: "DST",
    defaultServerPark: "gusty",
    serverParks: ["gusty"]
};

const viewedUserDetails = {
    data: {
        name: "John Doe",
        role: "IPS Manager",
        defaultServerPark: "gusty",
        serverParks: ["gusty", "cma"]
    },
    status: 200,
    message: "Successfully fetched user details for John Doe"
};

describe("ProfileTable", () => {
    it("matches snapshot", () => {
        const { asFragment } = render(
            <Router>
                <ProfileTable currentUser={currentUser} viewedUserDetails={viewedUserDetails} />
            </Router>
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("renders user details correctly", async () => {
        render(
            <Router>
                <ProfileTable currentUser={currentUser} viewedUserDetails={viewedUserDetails} />
            </Router>
        );

        expect(screen.getByText("John Doe")).toBeVisible();
        expect(screen.getByText("IPS Manager")).toBeVisible();
        expect(screen.getByText("gusty")).toBeVisible();
        expect(screen.getByText("gusty, cma")).toBeVisible();

        expect(await screen.findByText("Delete")).toBeVisible();
        const changeButtons = await screen.findAllByText("Change");
        changeButtons.forEach(button => {
            expect(button).toBeVisible();
        });
    });

    it("displays \"Not found\" for missing user details", () => {
        const missingDetails = {
            data: {
                name: "",
                role: "",
                defaultServerPark: "",
                serverParks: []
            },
            status: 500,
            message: "User not found"
        };

        render(
            <Router>
                <ProfileTable currentUser={currentUser} viewedUserDetails={missingDetails} />
            </Router>
        );

        expect(screen.getAllByText("Not found").length).toBeGreaterThan(0);
    });
});