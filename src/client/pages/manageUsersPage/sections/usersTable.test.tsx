import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import UsersTable from "./usersTable";

import type { User } from "blaise-api-node-client";

const currentUser: User = {
  name: "CurrentUser",
  role: "DST",
  defaultServerPark: "gusty",
  serverParks: ["gusty"],
};

const users: User[] = [
  {
    name: "ZuluUser",
    role: "DST",
    defaultServerPark: "gusty",
    serverParks: ["gusty"],
  },
  {
    name: "AlphaUser",
    role: "BDSS",
    defaultServerPark: "gusty",
    serverParks: ["gusty"],
  },
  {
    name: "CurrentUser",
    role: "Manager",
    defaultServerPark: "gusty",
    serverParks: ["gusty"],
  },
];

describe("UsersTable Component", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(
      <Router>
        <UsersTable
          users={users}
          currentUser={currentUser}
          listError=""
        />
      </Router>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("renders users sorted alphabetically and marks current user", () => {
    render(
      <Router>
        <UsersTable
          users={users}
          currentUser={currentUser}
          listError=""
        />
      </Router>,
    );

    const rows = screen.getAllByTestId("users-table-row");

    expect(rows[0]).toHaveTextContent("AlphaUser");
    expect(rows[1]).toHaveTextContent("CurrentUser");
    expect(rows[2]).toHaveTextContent("ZuluUser");
    expect(screen.getByText("(Current user)")).toBeVisible();
  });

  it("renders list error panel when there are no users", () => {
    render(
      <Router>
        <UsersTable
          users={[]}
          currentUser={currentUser}
          listError="No installed users found."
        />
      </Router>,
    );

    expect(screen.getByText("No installed users found.")).toBeVisible();
  });
});
