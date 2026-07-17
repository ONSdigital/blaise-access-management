import { cleanup, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import { Authenticate } from "blaise-login-react-client";
import { act } from "react-dom/test-utils";
import { BrowserRouter } from "react-router-dom";

import { mockFetchJsonResponse } from "../../test-utils/fetch.mock";

import ManageUsersPage from "./manageUsersPage";

import type { User } from "blaise-api-node-client";

type TestAuthenticate = typeof Authenticate & {
  OverrideReturnValues: (user: User | null, loggedIn: boolean) => void;
};
const mockAuthenticate = Authenticate as unknown as TestAuthenticate;

const signedInUser: User = {
  defaultServerPark: "gusty",
  name: "TestUser123",
  role: "DST",
  serverParks: ["gusty"],
};

const userList: User[] = [
  { defaultServerPark: "gusty", name: "ZuluUser", role: "DST", serverParks: ["gusty"] },
  { defaultServerPark: "gusty", name: "SecondUser", role: "BDSS", serverParks: ["gusty"] },
  { defaultServerPark: "gusty", name: "AlphaUser", role: "BDSS", serverParks: ["gusty"] },
];

describe("Manage Users page", () => {
  beforeAll(() => {
    mockAuthenticate.OverrideReturnValues(signedInUser, true);
    mockFetchJsonResponse(200, userList);
  });

  it("view users page matches Snapshot", async () => {
    const wrapper = render(<ManageUsersPage currentUser={signedInUser} />, {
      wrapper: BrowserRouter,
    });

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });

  it("should render correctly", async () => {
    render(<ManageUsersPage currentUser={signedInUser} />, { wrapper: BrowserRouter });

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByText(/Manage users/i)).toBeDefined();
      expect(screen.getByText(/Create new user/i)).toBeDefined();
      expect(screen.getByText(/ZuluUser/i)).toBeDefined();
      expect(screen.getByText(/SecondUser/i)).toBeDefined();
      expect(screen.getByText(/AlphaUser/i)).toBeDefined();
      expect(screen.getByLabelText(/Filter by user name/i)).toBeDefined();
      expect(screen.getByText(/3 results of 3/i)).toBeDefined();
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });

  it("should list users alphabetically by name", async () => {
    render(<ManageUsersPage currentUser={signedInUser} />, { wrapper: BrowserRouter });

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      const rows = screen.getAllByTestId("users-table-row");

      expect(rows[0]).toHaveTextContent("AlphaUser");
      expect(rows[1]).toHaveTextContent("SecondUser");
      expect(rows[2]).toHaveTextContent("ZuluUser");
    });
  });

  it("should filter users by name", async () => {
    render(<ManageUsersPage currentUser={signedInUser} />, { wrapper: BrowserRouter });

    await act(async () => {
      await Promise.resolve();
    });

    const filterInput = await screen.findByLabelText(/Filter by user name/i);

    await userEvent.type(filterInput, "alpha");

    await waitFor(() => {
      expect(screen.getByText(/1 results of 3/i)).toBeDefined();
      expect(screen.getByText(/AlphaUser/i)).toBeDefined();
      expect(screen.queryByText(/SecondUser/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/ZuluUser/i)).not.toBeInTheDocument();
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
    cleanup();
  });
});

describe("Given the API returns malformed json", () => {
  beforeAll(() => {
    mockAuthenticate.OverrideReturnValues(signedInUser, true);
    mockFetchJsonResponse(200, { text: "Hello" });
  });

  it("it should render with the error message displayed", async () => {
    render(<ManageUsersPage currentUser={signedInUser} />, { wrapper: BrowserRouter });

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
    mockAuthenticate.OverrideReturnValues(signedInUser, true);
    mockFetchJsonResponse(200, []);
  });

  it("it should render with a message to inform the user in the list", async () => {
    render(<ManageUsersPage currentUser={signedInUser} />, { wrapper: BrowserRouter });

    await act(async () => {
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByText(/No installed users found./i)).toBeDefined();
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
    cleanup();
  });
});
