import { cleanup, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, useParams } from "react-router-dom";

import { deleteUser } from "../../api/http";

import DeleteUser from "./deleteUserPage";

import type { Mock } from "vitest";

vi.mock("blaise-design-system-react-components", async () => {
  const { createDesignSystemMockModule } = await import("../../test-utils/designSystem.mock");

  return createDesignSystemMockModule();
});

vi.mock("react-router-dom", async () => {
  const actualModule = await vi.importActual("react-router-dom");

  return {
    ...actualModule,
    useParams: vi.fn(),
  };
});

vi.mock("../../api/http", () => ({
  deleteUser: vi.fn(),
}));

const mockUser = "testUser";

beforeEach(() => {
  (useParams as Mock).mockReturnValue({ user: mockUser });
});

afterEach(() => cleanup());

describe("DeleteUser Component", () => {
  it("matches the snapshot", () => {
    const { asFragment } = render(
      <MemoryRouter>
        <DeleteUser />
      </MemoryRouter>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("successfully deletes a user", async () => {
    (deleteUser as Mock).mockResolvedValue({ success: true, status: 204, data: {}, message: "" });

    const { getByText, getByLabelText } = render(
      <MemoryRouter>
        <DeleteUser />
      </MemoryRouter>,
    );

    userEvent.click(getByLabelText("Yes"));
    userEvent.click(getByText("Save"));

    await waitFor(() => {
      expect(deleteUser).toHaveBeenCalledWith(mockUser);
    });
  });

  it("shows error when deletion fails", async () => {
    (deleteUser as Mock).mockResolvedValue({ success: false, status: 500, data: {}, message: "" });

    const { getByText, getByLabelText } = render(
      <MemoryRouter>
        <DeleteUser />
      </MemoryRouter>,
    );

    await userEvent.click(getByLabelText("Yes"));
    await userEvent.click(getByText("Save"));

    await waitFor(() => {
      expect(getByText(/Failed to delete user/i)).toBeDefined();
    });
  });

  it("redirects when No is selected (action discarded)", async () => {
    const { getByText, getByLabelText } = render(
      <MemoryRouter>
        <DeleteUser />
      </MemoryRouter>,
    );

    await userEvent.click(getByLabelText("No"));
    await userEvent.click(getByText("Save"));

    await waitFor(() => {
      expect(deleteUser).not.toHaveBeenCalled();
    });
  });

  it("redirects with action discarded when no confirmation option is selected", async () => {
    const { getByText } = render(
      <MemoryRouter>
        <DeleteUser />
      </MemoryRouter>,
    );

    await userEvent.click(getByText("Save"));

    await waitFor(() => {
      expect(deleteUser).not.toHaveBeenCalled();
    });
  });

  it("submitting the form via onSubmit triggers deleteUserConfirm", async () => {
    (deleteUser as Mock).mockResolvedValue({ success: true, status: 204, data: {}, message: "" });

    const { getByLabelText, container } = render(
      <MemoryRouter>
        <DeleteUser />
      </MemoryRouter>,
    );

    await userEvent.click(getByLabelText("Yes"));

    const form = container.querySelector("form");

    if (form) {
      form.dispatchEvent(new Event("submit", { bubbles: true }));
    }

    await waitFor(() => {
      expect(deleteUser).toHaveBeenCalled();
    });
  });
});
