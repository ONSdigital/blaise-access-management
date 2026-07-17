import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";

import RolesTable from "./rolesTable";

import type { UserRole } from "blaise-api-node-client";

const roles: UserRole[] = [
  { name: "DST", permissions: ["Admin", "Bacon.access"], description: "A role" },
  { name: "BDSS", permissions: ["Admin"], description: "Another role" },
];

describe("RolesTable Component", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(
      <RolesTable
        roles={roles}
        listError=""
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("renders roles sorted by role name", () => {
    render(
      <RolesTable
        roles={roles}
        listError=""
      />,
    );

    const rows = screen.getAllByTestId("user-table-row");

    expect(rows[0]).toHaveTextContent("BDSS");
    expect(rows[1]).toHaveTextContent("DST");
  });

  it("renders list error panel when there are no roles", () => {
    render(
      <RolesTable
        roles={[]}
        listError="No installed roles found."
      />,
    );

    expect(screen.getByText("No installed roles found.")).toBeVisible();
  });
});
