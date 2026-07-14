import { cleanup, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Authenticate } from "blaise-login-react-client";
import { act } from "react-dom/test-utils";
import { BrowserRouter } from "react-router-dom";

import { mockFetchJsonResponse } from "../../test-utils/fetch.mock";

import ManageRolesPage from "./manageRolesPage";

import type { UserRole } from "blaise-api-node-client";

type TestAuthenticate = typeof Authenticate & {
  OverrideReturnValues: (user: unknown, loggedIn: boolean) => void;
};
const mockAuthenticate = Authenticate as unknown as TestAuthenticate;

const roleList: UserRole[] = [
  { name: "DST", permissions: ["Admin", "Bacon.access"], description: "A role" },
  { name: "BDSS", permissions: ["Admin"], description: "Another role" },
];

describe("Manage Roles page", () => {
  beforeAll(() => {
    mockAuthenticate.OverrideReturnValues(null, true);
    mockFetchJsonResponse(200, roleList);
  });

  it("view users page matches Snapshot", async () => {
    const wrapper = render(<ManageRolesPage />, { wrapper: BrowserRouter });

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });

  it("should render correctly", async () => {
    render(<ManageRolesPage />, { wrapper: BrowserRouter });

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(
        screen.getByText(/DST are responsible for creating and managing roles/i),
      ).toBeDefined();
      expect(screen.getByText(/Manage roles/i)).toBeDefined();
      expect(screen.getAllByText(/DST/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/BDSS/i)).toBeDefined();
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
    cleanup();
  });
});

describe("Given the API returns malformed json", () => {
  beforeAll(() => {
    mockAuthenticate.OverrideReturnValues(null, true);
    mockFetchJsonResponse(200, { text: "Hello" });
  });

  it("it should render with the error message displayed", async () => {
    render(<ManageRolesPage />, { wrapper: BrowserRouter });

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          /Sorry, there is a problem with this service. We are working to fix the problem. Please try again later./i,
        ),
      ).toBeDefined();
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
    cleanup();
  });
});

describe("Given the API returns an empty list", () => {
  beforeAll(() => {
    mockAuthenticate.OverrideReturnValues(null, true);
    mockFetchJsonResponse(200, []);
  });

  it("it should render with a message to inform the user in the list", async () => {
    render(<ManageRolesPage />, { wrapper: BrowserRouter });

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByText(/No installed roles found./i)).toBeDefined();
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
    cleanup();
  });
});
