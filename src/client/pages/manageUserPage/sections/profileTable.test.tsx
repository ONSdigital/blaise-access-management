import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import ProfileTable from "./profileTable";

const currentUser = {
  name: "CurrentUser",
  role: "DST",
  defaultServerPark: "gusty",
  serverParks: ["gusty"],
};

const viewedUserDetails = {
  data: {
    name: "testUser",
    role: "IPS Manager",
    defaultServerPark: "gusty",
    serverParks: ["gusty", "cma"],
  },
  status: 200,
  message: "Successfully fetched user details for testUser",
};

describe("ProfileTable Component", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(
      <Router>
        <ProfileTable
          currentUser={currentUser}
          viewedUserDetails={viewedUserDetails}
        />
      </Router>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("renders user details correctly", async () => {
    render(
      <Router>
        <ProfileTable
          currentUser={currentUser}
          viewedUserDetails={viewedUserDetails}
        />
      </Router>,
    );

    expect(screen.getByText("testUser")).toBeVisible();
    expect(screen.getByText("IPS Manager")).toBeVisible();
    expect(screen.getByText("gusty")).toBeVisible();
    expect(screen.getByText("gusty, cma")).toBeVisible();

    expect(await screen.findByText("Change password")).toBeVisible();
    expect(await screen.findByText("Change role")).toBeVisible();
    expect(await screen.findByText("Delete")).toBeVisible();
  });

  it('displays "Not found" for missing user details', () => {
    const missingDetails = {
      data: {
        name: "",
        role: "",
        defaultServerPark: "",
        serverParks: [],
      },
      status: 500,
      message: "User not found",
    };

    render(
      <Router>
        <ProfileTable
          currentUser={currentUser}
          viewedUserDetails={missingDetails}
        />
      </Router>,
    );

    expect(screen.getAllByText("Not found").length).toBeGreaterThan(0);
  });
});
