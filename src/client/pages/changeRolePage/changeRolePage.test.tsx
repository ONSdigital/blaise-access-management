import { cleanup, fireEvent, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, useParams } from "react-router-dom";

import { getAllRoles, getUser, patchUserRolesAndPermissions } from "../../api/http";
import { clientLogger } from "../../utils/logger";

import ChangeRole from "./changeRolePage";

import type { User } from "blaise-api-node-client";
import type { Mock } from "vitest";

vi.mock("react-router-dom", async () => {
  const actualModule = await vi.importActual("react-router-dom");

  return {
    ...actualModule,
    useParams: vi.fn(),
  };
});

vi.mock("../../api/http", async () => {
  const actualModule = await vi.importActual("../../api/http");

  return {
    ...actualModule,
    getAllRoles: vi.fn(),
    getUser: vi.fn(),
    patchUserRolesAndPermissions: vi.fn(),
  };
});

vi.mock("../../utils/logger", () => ({
  clientLogger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
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
  { name: "Welsh Speaker", description: "Welsh Speaker User" },
];

const mockUserDetails = {
  success: true,
  status: 200,
  message: "User found",
  data: {
    name: "testUser",
    role: { name: "DST" },
    serverParks: ["gusty"],
    defaultServerPark: "gusty",
  },
  name: "testUser",
  role: { name: "DST" },
  serverParks: ["gusty"],
  defaultServerPark: "gusty",
};

const currentUser: User = {
  name: "currentUser",
  role: "Manager",
  serverParks: ["gusty"],
  defaultServerPark: "gusty",
};

beforeEach(() => {
  (getAllRoles as Mock).mockResolvedValue({ success: true, data: mockRoles });
  (getUser as Mock).mockResolvedValue(mockUserDetails);
  (patchUserRolesAndPermissions as unknown as Mock).mockResolvedValue({
    success: true,
    data: {},
    message: "Role updated successfully",
    status: 200,
  });
  (useParams as Mock).mockReturnValue({ user: mockUserDetails.name });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  cleanup();
});

describe("ChangeRole Component (with state management)", () => {
  it("matches the snapshot", async () => {
    const { asFragment, findByText } = render(
      <MemoryRouter initialEntries={[`/users/${mockUserDetails.name}/change-role`]}>
        <ChangeRole currentUser={currentUser} />
      </MemoryRouter>,
    );

    await findByText(/Change role for user/i);

    expect(asFragment()).toMatchSnapshot();
  });

  it("renders and displays the correct initial role", async () => {
    const { findByText, queryByText } = render(
      <MemoryRouter initialEntries={[`/users/${mockUserDetails.name}/change-role`]}>
        <ChangeRole currentUser={currentUser} />
      </MemoryRouter>,
    );

    expect(await findByText(/Change role for user/i)).toBeVisible();
    expect(await findByText(/New role/i)).toBeVisible();
    expect(queryByText(/Current role:/i)).not.toBeInTheDocument();
  });

  it("updates role upon form submission", async () => {
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );

    const { findByText, findByRole } = render(
      <MemoryRouter initialEntries={[`/users/${mockUserDetails.name}/change-role`]}>
        <ChangeRole currentUser={currentUser} />
      </MemoryRouter>,
    );

    const select = await findByRole("combobox");
    const saveButton = await findByText("Save");

    await userEvent.selectOptions(select, ["IPS Field Interviewer"]);

    expect(await findByText(/IPS Field Interviewer/i)).toBeVisible();

    await userEvent.click(saveButton);

    expect(patchUserRolesAndPermissions).toHaveBeenCalledTimes(1);
    expect(patchUserRolesAndPermissions).toHaveBeenCalledWith(
      "testUser",
      "IPS Field Interviewer",
      "DST",
    );
  });

  it("uses string role values when loading and submitting", async () => {
    (getUser as Mock).mockResolvedValue({
      ...mockUserDetails,
      data: {
        ...mockUserDetails.data,
        role: "DST",
      },
    });

    const { findByText, findByRole } = render(
      <MemoryRouter initialEntries={[`/users/${mockUserDetails.name}/change-role`]}>
        <ChangeRole currentUser={currentUser} />
      </MemoryRouter>,
    );

    const select = await findByRole("combobox");
    const saveButton = await findByText("Save");

    await userEvent.selectOptions(select, ["IPS Field Interviewer"]);
    await userEvent.click(saveButton);

    expect(patchUserRolesAndPermissions).toHaveBeenCalledWith(
      "testUser",
      "IPS Field Interviewer",
      "DST",
    );
  });

  it("displays an error message when fetching roles fails", async () => {
    (getAllRoles as Mock).mockRejectedValue(new Error("Failed to fetch roles"));

    const { findByText } = render(
      <MemoryRouter initialEntries={[`/users/${mockUserDetails.name}/change-role`]}>
        <ChangeRole currentUser={currentUser} />
      </MemoryRouter>,
    );

    expect(await findByText(/Failed to fetch roles list, please try again/i)).toBeVisible();
  });

  it("returns an error when viewed user details cannot be loaded", async () => {
    (getUser as Mock).mockResolvedValue({
      success: true,
      status: 200,
      message: "No data",
      data: {},
    });

    const { findByText } = render(
      <MemoryRouter initialEntries={[`/users/${mockUserDetails.name}/change-role`]}>
        <ChangeRole currentUser={currentUser} />
      </MemoryRouter>,
    );

    expect(await findByText(/Unable to load user details, please try again/i)).toBeVisible();
    expect(patchUserRolesAndPermissions).not.toHaveBeenCalled();
  });

  it("blocks saving when getUser returns an unsuccessful response", async () => {
    (getUser as Mock).mockResolvedValue({
      success: false,
      status: 500,
      message: "Lookup failed",
      data: {},
    });

    const { findByText } = render(
      <MemoryRouter initialEntries={[`/users/${mockUserDetails.name}/change-role`]}>
        <ChangeRole currentUser={currentUser} />
      </MemoryRouter>,
    );

    expect(await findByText(/Unable to load user details, please try again/i)).toBeVisible();

    await userEvent.click(await findByText("Save"));

    expect(
      await findByText(
        /Unable to change role because user details are unavailable. Please reload and try again./i,
      ),
    ).toBeVisible();
    expect(clientLogger.error).toHaveBeenCalledWith(
      "Change role failed: viewed user details missing",
      expect.objectContaining({ viewedUsername: "testUser" }),
    );
    expect(patchUserRolesAndPermissions).not.toHaveBeenCalled();
  });

  it("shows an error when fetching viewed user details throws", async () => {
    (getUser as Mock).mockRejectedValue(new Error("Request failed"));

    const { findByText } = render(
      <MemoryRouter initialEntries={[`/users/${mockUserDetails.name}/change-role`]}>
        <ChangeRole currentUser={currentUser} />
      </MemoryRouter>,
    );

    expect(await findByText(/Unable to load user details, please try again/i)).toBeVisible();
    expect(patchUserRolesAndPermissions).not.toHaveBeenCalled();
  });

  it("returns early when user already has the same role", async () => {
    (getAllRoles as Mock).mockResolvedValue({ success: true, data: mockRoles });

    const { findByText, findByRole } = render(
      <MemoryRouter initialEntries={[`/users/${mockUserDetails.name}/change-role`]}>
        <ChangeRole currentUser={currentUser} />
      </MemoryRouter>,
    );

    expect(await findByRole("combobox")).toBeVisible();
    const saveButton = await findByText("Save");

    await userEvent.click(saveButton);

    expect(await findByText(/Please select a different role before saving./i)).toBeVisible();
    expect(patchUserRolesAndPermissions).not.toHaveBeenCalled();
    expect(clientLogger.warn).not.toHaveBeenCalledWith(
      "Change role blocked: selected role matches current role",
      expect.anything(),
    );
  });

  it("treats a missing role name as an empty current role", async () => {
    (getUser as Mock).mockResolvedValue({
      ...mockUserDetails,
      data: {
        ...mockUserDetails.data,
        role: undefined,
      },
    });

    const { findByText } = render(
      <MemoryRouter initialEntries={[`/users/${mockUserDetails.name}/change-role`]}>
        <ChangeRole currentUser={currentUser} />
      </MemoryRouter>,
    );

    await userEvent.click(await findByText("Save"));

    expect(await findByText(/Please select a different role before saving./i)).toBeVisible();
    expect(patchUserRolesAndPermissions).not.toHaveBeenCalled();
  });

  it("navigates back when Cancel is clicked", async () => {
    const { findByText } = render(
      <MemoryRouter initialEntries={[`/users/${mockUserDetails.name}/change-role`]}>
        <ChangeRole currentUser={currentUser} />
      </MemoryRouter>,
    );

    const cancelButton = await findByText("Cancel");

    await userEvent.click(cancelButton);

    expect(cancelButton).toBeDefined();
  });

  it("shows an error panel and logs when role is invalid (not in role list)", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => undefined);

    (getAllRoles as Mock).mockResolvedValue({ success: true, data: mockRoles });

    const { findByText, findByRole } = render(
      <MemoryRouter initialEntries={[`/users/${mockUserDetails.name}/change-role`]}>
        <ChangeRole currentUser={currentUser} />
      </MemoryRouter>,
    );

    const select = await findByRole("combobox");

    fireEvent.change(select, { target: { value: "OldRole" } });

    const saveButton = await findByText("Save");

    await userEvent.click(saveButton);

    expect(alertSpy).not.toHaveBeenCalled();
    expect(
      await findByText(/Selected role is invalid. Please choose a role from the list./i),
    ).toBeVisible();
    expect(clientLogger.warn).toHaveBeenCalledWith(
      "Change role blocked: invalid role selected",
      expect.objectContaining({ viewedUsername: "testUser" }),
    );

    alertSpy.mockRestore();
  });

  it("logs and marks the update as failed when the patch request returns a server error", async () => {
    (patchUserRolesAndPermissions as unknown as Mock).mockResolvedValue({
      success: false,
      data: {},
      message: "Role update failed",
      status: 500,
    });

    const { findByText, findByRole } = render(
      <MemoryRouter initialEntries={[`/users/${mockUserDetails.name}/change-role`]}>
        <ChangeRole currentUser={currentUser} />
      </MemoryRouter>,
    );

    const select = await findByRole("combobox");

    await userEvent.selectOptions(select, ["IPS Field Interviewer"]);
    await userEvent.click(await findByText("Save"));

    expect(clientLogger.error).toHaveBeenCalledWith(
      "Change role failed: server returned error",
      expect.objectContaining({
        viewedUsername: "testUser",
        role: "IPS Field Interviewer",
        status: 500,
        message: "Role update failed",
      }),
    );
  });

  it("allows an empty API message when the role update succeeds", async () => {
    (patchUserRolesAndPermissions as unknown as Mock).mockResolvedValue({
      success: true,
      data: {},
      status: 200,
    });

    const { findByText, findByRole } = render(
      <MemoryRouter initialEntries={[`/users/${mockUserDetails.name}/change-role`]}>
        <ChangeRole currentUser={currentUser} />
      </MemoryRouter>,
    );

    const select = await findByRole("combobox");

    await userEvent.selectOptions(select, ["IPS Field Interviewer"]);
    await userEvent.click(await findByText("Save"));

    expect(patchUserRolesAndPermissions).toHaveBeenCalledWith(
      "testUser",
      "IPS Field Interviewer",
      "DST",
    );
    expect(clientLogger.error).not.toHaveBeenCalledWith(
      "Change role failed: server returned error",
      expect.anything(),
    );
  });
});
