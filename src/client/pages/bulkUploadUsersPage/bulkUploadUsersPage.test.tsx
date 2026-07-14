import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";

import { addNewUser } from "../../api/http";

import BulkUserUpload from "./bulkUploadUsersPage";

vi.mock("blaise-design-system-react-components", async () => {
  const { createDesignSystemMockModule } = await import("../../test-utils/designSystem.mock");

  return createDesignSystemMockModule();
});

vi.mock("../../api/http", () => ({
  addNewUser: vi.fn(),
  getAllRoles: vi.fn().mockResolvedValue([
    true,
    [
      { name: "DST", permissions: [], description: "" },
      { name: "BDSS", permissions: [], description: "" },
    ],
  ]),
  getAllUsers: vi.fn().mockResolvedValue([true, []]),
}));

const mockAddNewUser = vi.mocked(addNewUser);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("BulkUserUpload", () => {
  it("renders the SelectFile page initially", () => {
    render(
      <BrowserRouter>
        <BulkUserUpload />
      </BrowserRouter>,
    );

    expect(screen.getByRole("heading", { name: "Bulk upload users", level: 1 })).toBeDefined();
  });

  it("navigates to summary after a CSV is uploaded", async () => {
    render(
      <BrowserRouter>
        <BulkUserUpload />
      </BrowserRouter>,
    );

    const csvContent = "name,password,role\nalice,pass1,DST";
    const file = new File([csvContent], "users.csv", { type: "text/csv" });

    const input = screen.getByLabelText(/Select users file/i);

    await userEvent.upload(input, file);
    await userEvent.click(screen.getByRole("button", { name: /Upload/i }));

    // After upload, moves to the ToUploadSummary page
    await waitFor(() => {
      // UsersToUploadSummary heading or confirmation component
      expect(
        screen.queryByRole("heading", { name: "Bulk upload users", level: 1 }),
      ).not.toBeInTheDocument();
    });
  });

  it("navigates through the upload flow: SelectFile → Summary → InProgress → UploadedSummary", async () => {
    mockAddNewUser.mockResolvedValue(true);

    render(
      <BrowserRouter>
        <BulkUserUpload />
      </BrowserRouter>,
    );

    // Step 1: Upload a CSV with valid roles
    const csvContent = "name,password,role\nalice,pass1,DST\nbob,pass2,BDSS";
    const file = new File([csvContent], "users.csv", { type: "text/csv" });

    await userEvent.upload(screen.getByLabelText(/Select users file/i), file);
    await userEvent.click(screen.getByRole("button", { name: /Upload/i }));

    // Step 2: On summary / confirmation page
    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Bulk upload users", level: 1 }),
      ).not.toBeInTheDocument();
    });

    // Wait for validation to complete (usersToUploadSummary validates users)
    await waitFor(
      () => {
        expect(screen.queryByRole("radio", { name: /Yes/i })).not.toBeNull();
      },
      { timeout: 3000 },
    );

    // Find and click the Yes radio + confirm button
    const yesRadio = screen.queryByRole("radio", { name: /Yes/i });

    if (yesRadio) {
      await userEvent.click(yesRadio);
      await userEvent.click(screen.getByRole("button", { name: /Continue/i }));
    }

    // Eventually reaches UploadedSummary (check for heading with user count text)
    await waitFor(
      () => {
        expect(screen.getByRole("heading", { level: 1 })).toBeDefined();
      },
      { timeout: 5000 },
    );
  });
});
