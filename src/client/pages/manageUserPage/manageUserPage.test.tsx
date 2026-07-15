import { act, cleanup, render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, useParams } from "react-router-dom";

import * as http from "../../api/http";

import ManageUserPage from "./manageUserPage";

import type { User } from "blaise-api-node-client";
import type { Mock } from "vitest";

vi.mock("react-router-dom", async () => {
  const actualModule = await vi.importActual("react-router-dom");

  return {
    ...actualModule,
    useParams: vi.fn(),
  };
});

vi.mock("../../api/http", () => ({
  getUser: vi.fn(),
}));

const mockUserDetails = {
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

const mockState = {
  pathname: `/users/${mockUserDetails.data.name}`,
  state: { updatedPanel: null },
};

const currentUser: User = {
  name: "currentUser",
  role: "Manager",
  serverParks: ["gusty"],
  defaultServerPark: "gusty",
};

beforeEach(() => {
  vi.clearAllMocks();
  (useParams as Mock).mockReturnValue({ user: mockUserDetails.data.name });
});

afterEach(() => cleanup());

describe("ManageUserPage Component", () => {
  it("matches the snapshot", async () => {
    (http.getUser as Mock).mockResolvedValue(mockUserDetails);

    const { asFragment } = render(
      <MemoryRouter initialEntries={[mockState]}>
        <ManageUserPage
          currentUser={currentUser}
          updatedPanel={null}
        />
      </MemoryRouter>,
    );

    await act(async () => {});

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it("displays user details on successful fetch", async () => {
    (http.getUser as Mock).mockResolvedValue(mockUserDetails);

    const { findByText } = render(
      <MemoryRouter initialEntries={[mockState]}>
        <ManageUserPage
          currentUser={currentUser}
          updatedPanel={null}
        />
      </MemoryRouter>,
    );

    expect(await findByText(mockUserDetails.data.name)).toBeVisible();
    expect(await findByText(mockUserDetails.data.role)).toBeVisible();
    expect(await findByText(mockUserDetails.data.defaultServerPark)).toBeVisible();
    expect(await findByText(mockUserDetails.data.serverParks.join(", "))).toBeVisible();
    expect(await findByText("Change password")).toBeVisible();
    expect(await findByText("Change role")).toBeVisible();
    expect(await findByText("Delete")).toBeVisible();
  });

  it("displays error message on fetch failure", async () => {
    (http.getUser as Mock).mockRejectedValue(
      new Error(
        "Unable to load user details, please try again. If this continues, please the contact service desk.",
      ),
    );

    const { findByText } = render(
      <MemoryRouter initialEntries={[mockState]}>
        <ManageUserPage
          currentUser={currentUser}
          updatedPanel={null}
        />
      </MemoryRouter>,
    );

    expect(
      await findByText(
        /Unable to load user details, please try again. If this continues, please the contact service desk./i,
      ),
    ).toBeVisible();
  });
});
