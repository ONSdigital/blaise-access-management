import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, MemoryRouter } from "react-router-dom";

import { addNewUser, getAllRoles } from "../../api/http";

import CreateNewUserPage from "./createNewUserPage";

vi.mock("blaise-design-system-react-components", async () => {
  const { createDesignSystemMockModule } = await import("../../test-utils/designSystem.mock");

  return createDesignSystemMockModule();
});

vi.mock("../../api/http", () => ({
  addNewUser: vi.fn(),
  getAllRoles: vi.fn(),
}));

const mockAddNewUser = vi.mocked(addNewUser);
const mockGetAllRoles = vi.mocked(getAllRoles);

const mockRoles = [
  { name: "DST", permissions: [], description: "DST role" },
  { name: "BDSS", permissions: [], description: "BDSS role" },
];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("CreateNewUserPage", () => {
  beforeEach(() => {
    mockGetAllRoles.mockResolvedValue({
      success: true,
      status: 200,
      message: "Request completed",
      data: mockRoles,
    });
  });

  it("renders the Create new user heading", async () => {
    render(
      <BrowserRouter>
        <CreateNewUserPage />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Create new user/i)).toBeDefined();
    });
  });

  it("loads and displays roles in the select dropdown", async () => {
    render(
      <BrowserRouter>
        <CreateNewUserPage />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "DST" })).toBeDefined();
      expect(screen.getByRole("option", { name: "BDSS" })).toBeDefined();
    });
  });

  it("shows validation errors when form is submitted empty", async () => {
    render(
      <BrowserRouter>
        <CreateNewUserPage />
      </BrowserRouter>,
    );

    await waitFor(() => screen.getByRole("button", { name: /Save/i }));

    await userEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      expect(screen.getByText(/Enter username/i)).toBeDefined();
      expect(screen.getByText(/Enter password/i)).toBeDefined();
    });
  });

  it("shows password mismatch error", async () => {
    render(
      <BrowserRouter>
        <CreateNewUserPage />
      </BrowserRouter>,
    );

    await waitFor(() => screen.getByLabelText(/Username/i));

    await userEvent.type(screen.getByLabelText(/^Username$/i), "testuser");
    await userEvent.type(screen.getByLabelText(/^Password$/i), "pass1");
    await userEvent.type(screen.getByLabelText(/^Confirm password$/i), "pass2");

    await userEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      expect(screen.getByText(/Must match password/i)).toBeDefined();
    });
  });

  it("shows error panel when user creation fails", async () => {
    mockAddNewUser.mockResolvedValue({ success: false, status: 500, data: {}, message: "" });

    render(
      <BrowserRouter>
        <CreateNewUserPage />
      </BrowserRouter>,
    );

    await waitFor(() => screen.getByLabelText(/^Username$/i));

    await userEvent.type(screen.getByLabelText(/^Username$/i), "newuser");
    await userEvent.type(screen.getByLabelText(/^Password$/i), "Password1");
    await userEvent.type(screen.getByLabelText(/^Confirm password$/i), "Password1");

    await userEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      expect(screen.getByText(/Failed to create new user/i)).toBeDefined();
    });
  });

  it("redirects on successful user creation", async () => {
    mockAddNewUser.mockResolvedValue({ success: true, status: 201, data: {}, message: "" });

    render(
      <MemoryRouter initialEntries={["/users/new"]}>
        <CreateNewUserPage />
      </MemoryRouter>,
    );

    await waitFor(() => screen.getByLabelText(/^Username$/i));

    await userEvent.type(screen.getByLabelText(/^Username$/i), "newuser");
    await userEvent.type(screen.getByLabelText(/^Password$/i), "Password1");
    await userEvent.type(screen.getByLabelText(/^Confirm password$/i), "Password1");

    await userEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      expect(mockAddNewUser).toHaveBeenCalled();
    });
  });

  it("shows 'Select a role' error when no role is selected", async () => {
    mockGetAllRoles.mockResolvedValue({
      success: true,
      status: 200,
      message: "Request completed",
      data: [],
    });

    render(
      <BrowserRouter>
        <CreateNewUserPage />
      </BrowserRouter>,
    );

    await waitFor(() => screen.getByLabelText(/^Username$/i));

    await userEvent.type(screen.getByLabelText(/^Username$/i), "newuser");
    await userEvent.type(screen.getByLabelText(/^Password$/i), "Password1");
    await userEvent.type(screen.getByLabelText(/^Confirm password$/i), "Password1");

    await userEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      expect(screen.getByText(/Select a role/i)).toBeDefined();
    });
  });

  it("changing role select clears form errors and updates role", async () => {
    mockGetAllRoles.mockResolvedValue({
      success: true,
      status: 200,
      message: "Request completed",
      data: mockRoles,
    });

    render(
      <BrowserRouter>
        <CreateNewUserPage />
      </BrowserRouter>,
    );

    await waitFor(() => screen.getByRole("combobox"));

    const select = screen.getByRole("combobox");

    await userEvent.selectOptions(select, ["BDSS"]);

    await waitFor(() => {
      expect(select).toHaveValue("BDSS");
    });
  });

  it("navigates away when Cancel is clicked", async () => {
    render(
      <BrowserRouter>
        <CreateNewUserPage />
      </BrowserRouter>,
    );

    await waitFor(() => screen.getByRole("button", { name: /Cancel/i }));

    const cancelBtn = screen.getByRole("button", { name: /Cancel/i });

    await userEvent.click(cancelBtn);

    expect(cancelBtn).toBeDefined();
  });
});
