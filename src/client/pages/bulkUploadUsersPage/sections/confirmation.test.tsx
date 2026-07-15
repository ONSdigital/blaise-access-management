import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";

import Confirmation from "./confirmation";

vi.mock("blaise-design-system-react-components", async () => {
  const { createDesignSystemMockModule } = await import("../../../test-utils/designSystem.mock");

  return createDesignSystemMockModule();
});

const mockUploadUsers = vi.fn();

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Confirmation", () => {
  it("renders the confirmation form", () => {
    render(
      <BrowserRouter>
        <Confirmation
          validUsers={3}
          uploadUsers={mockUploadUsers}
        />
      </BrowserRouter>,
    );

    expect(screen.getByRole("radio", { name: /Yes/i })).toBeDefined();
    expect(screen.getByRole("radio", { name: /No/i })).toBeDefined();
  });

  it("shows an error when Continue is clicked without selecting an option", async () => {
    render(
      <BrowserRouter>
        <Confirmation
          validUsers={3}
          uploadUsers={mockUploadUsers}
        />
      </BrowserRouter>,
    );

    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/Select an answer/i)).toBeDefined();
    });
  });

  it("calls uploadUsers when Yes is selected and Continue is clicked", async () => {
    render(
      <BrowserRouter>
        <Confirmation
          validUsers={2}
          uploadUsers={mockUploadUsers}
        />
      </BrowserRouter>,
    );

    await userEvent.click(screen.getByRole("radio", { name: /Yes/i }));
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(mockUploadUsers).toHaveBeenCalled();
    });
  });

  it("navigates away when No is selected and Continue is clicked", async () => {
    render(
      <BrowserRouter>
        <Confirmation
          validUsers={2}
          uploadUsers={mockUploadUsers}
        />
      </BrowserRouter>,
    );

    await userEvent.click(screen.getByRole("radio", { name: /No/i }));
    await userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    expect(mockUploadUsers).not.toHaveBeenCalled();
  });

  it("shows Cancel button when not loading", () => {
    render(
      <BrowserRouter>
        <Confirmation
          validUsers={1}
          uploadUsers={mockUploadUsers}
        />
      </BrowserRouter>,
    );

    expect(screen.getByRole("button", { name: /Cancel/i })).toBeDefined();
  });

  it("renders label with word form of validUsers count", () => {
    render(
      <BrowserRouter>
        <Confirmation
          validUsers={5}
          uploadUsers={mockUploadUsers}
        />
      </BrowserRouter>,
    );

    expect(screen.getByText(/five/i)).toBeDefined();
  });

  it("Cancel button navigates away without uploading", async () => {
    render(
      <BrowserRouter>
        <Confirmation
          validUsers={2}
          uploadUsers={mockUploadUsers}
        />
      </BrowserRouter>,
    );

    await userEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    expect(mockUploadUsers).not.toHaveBeenCalled();
  });
});
