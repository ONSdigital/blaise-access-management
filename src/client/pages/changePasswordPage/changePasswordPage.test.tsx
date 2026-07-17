import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, Route, Routes, useLocation, useParams } from "react-router-dom";

import { editPassword } from "../../api/http/users";

import ChangePassword from "./changePasswordPage";

import type { User } from "blaise-api-node-client";
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

vi.mock("blaise-login-react-client", () => ({
  AuthManager: class {
    authHeader() {
      return {
        Authorization: "Bearer mock-token",
      };
    }
  },
  createSessionKey: vi.fn().mockReturnValue("mock-session-key"),
}));

vi.mock("../../api/http/users", async () => {
  const actualModule = await vi.importActual("../../api/http/users");

  return {
    ...actualModule,
    editPassword: vi.fn(),
  };
});

const mockUserDetails = {
  name: "testUser",
};

const mockState = {
  pathname: `/users/${mockUserDetails.name}/change-password`,
  state: { currentUser: "currentUser" },
};

const currentUser: User = {
  name: "currentUser",
  role: "Manager",
  serverParks: ["gusty"],
  defaultServerPark: "gusty",
};

function RedirectStateMessage() {
  const { state } = useLocation();
  const message = (state as { updatedPanel?: { message?: string } } | null)?.updatedPanel?.message;

  return <>{message ?? ""}</>;
}

beforeEach(() => {
  (editPassword as Mock).mockClear();
  (useParams as Mock).mockReturnValue({ user: mockUserDetails.name });
});

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe("ChangePassword Component", () => {
  it("matches the snapshot", async () => {
    const { asFragment } = render(
      <MemoryRouter initialEntries={[mockState]}>
        <ChangePassword currentUser={currentUser} />
      </MemoryRouter>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("displays error message when passwords are empty", async () => {
    const { findByText, getByText } = render(
      <MemoryRouter initialEntries={[mockState]}>
        <ChangePassword currentUser={currentUser} />
      </MemoryRouter>,
    );

    const saveButton = getByText("Save");

    await userEvent.click(saveButton);

    expect(await findByText(/Passwords cannot be blank/i)).toBeVisible();
  });

  it("displays error message when passwords do not match", async () => {
    const { findByText, getByLabelText, getByText } = render(
      <MemoryRouter initialEntries={[mockState]}>
        <ChangePassword currentUser={currentUser} />
      </MemoryRouter>,
    );

    const newPasswordInput = getByLabelText("New password");
    const confirmPasswordInput = getByLabelText("Confirm password");
    const saveButton = getByText("Save");

    await userEvent.type(newPasswordInput, "password123");
    await userEvent.type(confirmPasswordInput, "password321333");
    await userEvent.click(saveButton);

    expect(await findByText(/Passwords do not match/i)).toBeVisible();
  });

  it("calls editPassword function with correct parameters upon form submission with correct username and password without any trailing whitespaces", async () => {
    const { getByLabelText, getByText } = render(
      <MemoryRouter initialEntries={[mockState]}>
        <ChangePassword currentUser={currentUser} />
      </MemoryRouter>,
    );

    const newPasswordInput = getByLabelText("New password");
    const confirmPasswordInput = getByLabelText("Confirm password");
    const saveButton = getByText("Save");

    await userEvent.type(newPasswordInput, "password123  ");
    await userEvent.type(confirmPasswordInput, "password123       ");
    await userEvent.click(saveButton);

    expect(editPassword).toHaveBeenCalledWith("testUser", "password123");
  });

  it("calls editPassword function with correct parameters upon form submission with correct username and password", async () => {
    const { getByLabelText, getByText } = render(
      <MemoryRouter initialEntries={[mockState]}>
        <ChangePassword currentUser={currentUser} />
      </MemoryRouter>,
    );

    const newPasswordInput = getByLabelText("New password");
    const confirmPasswordInput = getByLabelText("Confirm password");
    const saveButton = getByText("Save");

    await userEvent.type(newPasswordInput, "password123");
    await userEvent.type(confirmPasswordInput, "password123");
    await userEvent.click(saveButton);

    expect(editPassword).toHaveBeenCalledWith("testUser", "password123");
  });

  it("displays error message if the function returns false", async () => {
    const { getByLabelText, getByText, findByText } = render(
      <MemoryRouter initialEntries={[mockState]}>
        <ChangePassword currentUser={currentUser} />
      </MemoryRouter>,
    );

    const newPasswordInput = getByLabelText("New password");
    const confirmPasswordInput = getByLabelText("Confirm password");
    const saveButton = getByText("Save");

    (editPassword as Mock).mockResolvedValue({
      success: false,
      status: 500,
      data: {},
      message: "",
    });
    await userEvent.type(newPasswordInput, "password123");
    await userEvent.type(confirmPasswordInput, "password123");
    await userEvent.click(saveButton);

    expect(editPassword).toHaveBeenCalledWith("testUser", "password123");
    expect(await findByText(/Set password failed/i)).toBeVisible();
  });

  it("displays success message if the function returns true", async () => {
    const initialPath = `/users/${mockUserDetails.name}/change-password`;
    const destinationPath = `/users/${mockUserDetails.name}`;

    const { getByLabelText, getByText, findByText } = render(
      <MemoryRouter initialEntries={[mockState]}>
        <Routes>
          <Route
            path={initialPath}
            element={<ChangePassword currentUser={currentUser} />}
          />
          <Route
            path={destinationPath}
            element={<RedirectStateMessage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    const newPasswordInput = getByLabelText("New password");
    const confirmPasswordInput = getByLabelText("Confirm password");
    const saveButton = getByText("Save");

    (editPassword as Mock).mockResolvedValue({ success: true, status: 204, data: {}, message: "" });
    await userEvent.type(newPasswordInput, "password123");
    await userEvent.type(confirmPasswordInput, "password123");
    await userEvent.click(saveButton);

    expect(editPassword).toHaveBeenCalledWith("testUser", "password123");
    expect(await findByText("Password successfully changed for user testUser")).toBeInTheDocument();
  });
});

it("navigates back when Cancel is clicked", async () => {
  const { getByText } = render(
    <MemoryRouter initialEntries={[mockState]}>
      <Routes>
        <Route
          path="/users/:user/change-password"
          element={<ChangePassword currentUser={currentUser} />}
        />
      </Routes>
    </MemoryRouter>,
  );

  const cancelButton = getByText("Cancel");

  await userEvent.click(cancelButton);

  expect(cancelButton).toBeDefined();
});
