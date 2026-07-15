import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import UserTable from "./userTable";

const currentUser = {
  name: "CurrentUser",
  role: "DST",
  defaultServerPark: "gusty",
  serverParks: ["gusty"],
};

const viewedUserDetails = {
  success: true,
  data: {
    name: "testUser",
    role: "IPS Manager",
    defaultServerPark: "gusty",
    serverParks: ["gusty", "cma"],
  },
  status: 200,
  message: "Successfully fetched user details for testUser",
};

describe("UserTable Component", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(
      <Router>
        <UserTable
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
        <UserTable
          currentUser={currentUser}
          viewedUserDetails={viewedUserDetails}
        />
      </Router>,
    );

    expect(screen.getByText("IPS Manager")).toBeVisible();
    expect(screen.getByText("gusty")).toBeVisible();
    expect(screen.getByText("gusty, cma")).toBeVisible();

    expect(await screen.findByText("Change password")).toBeVisible();
    expect(await screen.findByText("Change role")).toBeVisible();
    expect(await screen.findByText("Delete")).toBeVisible();
  });

  it('displays "Not found" for missing user details', () => {
    const missingDetails = {
      success: false,
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
        <UserTable
          currentUser={currentUser}
          viewedUserDetails={missingDetails}
        />
      </Router>,
    );

    expect(screen.getAllByText("Not found").length).toBeGreaterThan(0);
  });
});
