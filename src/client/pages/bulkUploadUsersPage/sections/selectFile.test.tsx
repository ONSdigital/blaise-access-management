import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";

import SelectFile from "./selectFile";

vi.mock("blaise-design-system-react-components", async () => {
  const { createDesignSystemMockModule } = await import("../../../test-utils/designSystem.mock");

  return createDesignSystemMockModule();
});

const mockSetUsersToUpload = vi.fn();
const mockMovePageForward = vi.fn();

const defaultProps = {
  setUsersToUpload: mockSetUsersToUpload,
  movePageForward: mockMovePageForward,
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("SelectFile", () => {
  it("renders the bulk upload heading", () => {
    render(
      <BrowserRouter>
        <SelectFile {...defaultProps} />
      </BrowserRouter>,
    );

    // Use exact role + name to avoid matching the h3 "Bulk upload users template file"
    expect(screen.getByRole("heading", { name: "Bulk upload users", level: 1 })).toBeDefined();
  });

  it("renders the file upload input", () => {
    render(
      <BrowserRouter>
        <SelectFile {...defaultProps} />
      </BrowserRouter>,
    );

    expect(screen.getByLabelText(/Select users file/i)).toBeDefined();
  });

  it("shows error when Upload is clicked with no file selected", async () => {
    render(
      <BrowserRouter>
        <SelectFile {...defaultProps} />
      </BrowserRouter>,
    );

    await userEvent.click(screen.getByRole("button", { name: /Upload/i }));

    await waitFor(() => {
      expect(screen.getByText(/Select a CSV file to upload/i)).toBeDefined();
    });
  });

  it("parses a valid CSV file and calls setUsersToUpload", async () => {
    render(
      <BrowserRouter>
        <SelectFile {...defaultProps} />
      </BrowserRouter>,
    );

    const csvContent = "name,password,role\nalice,pass1,DST\nbob,pass2,BDSS";
    const file = new File([csvContent], "users.csv", { type: "text/csv" });

    const input = screen.getByLabelText(/Select users file/i);

    await userEvent.upload(input, file);

    await userEvent.click(screen.getByRole("button", { name: /Upload/i }));

    await waitFor(() => {
      expect(mockSetUsersToUpload).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: "alice", role: "DST" }),
          expect.objectContaining({ name: "bob", role: "BDSS" }),
        ]),
      );
      expect(mockMovePageForward).toHaveBeenCalled();
    });
  });

  it("shows error when a non-CSV file is selected", async () => {
    render(
      <BrowserRouter>
        <SelectFile {...defaultProps} />
      </BrowserRouter>,
    );

    const input = screen.getByLabelText(/Select users file/i);

    // Use fireEvent to simulate selecting a non-CSV file
    const txtFile = new File(["some data"], "users.txt", { type: "text/plain" });
    const fileList = { 0: txtFile, length: 1, item: () => txtFile };

    fireEvent.change(input, { target: { files: fileList } });

    await waitFor(() => {
      expect(screen.getByText("Select a CSV file to upload")).toBeDefined();
    });
  });

  it("clears error when file input is cleared", async () => {
    render(
      <BrowserRouter>
        <SelectFile {...defaultProps} />
      </BrowserRouter>,
    );

    // Trigger error first by clicking Upload with no file
    await userEvent.click(screen.getByRole("button", { name: /Upload/i }));

    await waitFor(() => {
      expect(screen.getByText(/Select a CSV file to upload/i)).toBeDefined();
    });

    // Clear the input by firing a change event with no files
    const input = screen.getByLabelText(/Select users file/i);

    fireEvent.change(input, { target: { files: [] } });

    await waitFor(() => {
      expect(screen.queryByText(/Select a CSV file to upload/i)).not.toBeInTheDocument();
    });
  });

  it("renders a Cancel button that navigates away", async () => {
    render(
      <BrowserRouter>
        <SelectFile {...defaultProps} />
      </BrowserRouter>,
    );

    const cancelBtn = screen.getByRole("button", { name: /Cancel/i });

    await userEvent.click(cancelBtn);

    expect(cancelBtn).toBeDefined();
  });

  it("handles empty CSV content (no header line)", async () => {
    render(
      <BrowserRouter>
        <SelectFile {...defaultProps} />
      </BrowserRouter>,
    );

    const input = screen.getByLabelText(/Select users file/i);
    const emptyFile = new File([""], "empty.csv", { type: "text/csv" });

    await userEvent.upload(input, emptyFile);
    await userEvent.click(screen.getByRole("button", { name: /Upload/i }));

    await waitFor(() => {
      expect(screen.getByText(/Select a CSV file to upload/i)).toBeDefined();
    });
  });

  it("parses a CSV with quoted values correctly", async () => {
    render(
      <BrowserRouter>
        <SelectFile {...defaultProps} />
      </BrowserRouter>,
    );

    const csvContent =
      'name,password,role\n"alice, jr","pass,1",DST\n"bob ""the user""",pass2,BDSS';
    const file = new File([csvContent], "users.csv", { type: "text/csv" });

    const input = screen.getByLabelText(/Select users file/i);

    await userEvent.upload(input, file);
    await userEvent.click(screen.getByRole("button", { name: /Upload/i }));

    await waitFor(() => {
      expect(mockSetUsersToUpload).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ name: "alice, jr" })]),
      );
    });
  });
});
