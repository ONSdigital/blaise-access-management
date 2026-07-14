import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthClient } from "blaise-login-react-client";
import { BrowserRouter } from "react-router-dom";

import { AUTH_EXPIRED_EVENT_NAME } from "./api/http/axiosAuthConfig";
import App from "./app";

import type { User } from "blaise-api-node-client";

type TestAuthClient = typeof AuthClient & {
  OverrideReturnValues: (user: User | null, loggedIn: boolean) => void;
};
const mockAuthClient = AuthClient as unknown as TestAuthClient;

const userMockObject: User = {
  name: "Jake Bullet",
  role: "Manager",
  serverParks: ["gusty"],
  defaultServerPark: "gusty",
};

const user = userMockObject;

vi.mock("./pages/bulkUploadUsersPage/bulkUploadUsersPage", () => ({
  default: () => <div>Mock bulk upload page</div>,
}));
vi.mock("./pages/changePasswordPage/changePasswordPage", () => ({
  default: () => <div>Mock change password page</div>,
}));
vi.mock("./pages/changeRolePage/changeRolePage", () => ({
  default: () => <div>Mock change role page</div>,
}));
vi.mock("./pages/createNewUserPage/createNewUserPage", () => ({
  default: () => <div>Mock create new user page</div>,
}));
vi.mock("./pages/deleteUserPage/deleteUserPage", () => ({
  default: () => <div>Mock delete user page</div>,
}));
vi.mock("./pages/manageUserPage/manageUserPage", () => ({
  default: () => <div>Mock manage user page</div>,
}));
vi.mock("./pages/manageRolesPage/manageRolesPage", () => ({
  default: () => <div>Mock manage roles page</div>,
}));
vi.mock("./pages/manageUsersPage/manageUsersPage", () => ({
  default: () => <div>Mock manage users page</div>,
}));

function createDeferredPromise<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
} {
  let resolve: ((value: T) => void) | undefined;
  let reject: ((error: unknown) => void) | undefined;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve: (value: T) => resolve?.(value),
    reject: (error: unknown) => reject?.(error),
  };
}

describe("React homepage", () => {
  beforeEach(() => {
    window.history.pushState({}, "Home", "/");
    mockAuthClient.OverrideReturnValues(user, true);
  });

  it("the homepage matches Snapshot", async () => {
    const wrapper = render(<App />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });

  it("should render correctly", async () => {
    render(<App />, { wrapper: BrowserRouter });

    expect(screen.getByText(/Blaise Access Management/i)).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText(/Blaise Access Management/i)).toBeDefined();
      expect(screen.queryAllByText(/Manage users/i)).toBeDefined();
      expect(screen.queryAllByText(/Manage roles/i)).toBeDefined();
      expect(screen.queryAllByText(/View access history/i)).toBeDefined();
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });

  it("should render Access history page on /audit", async () => {
    window.history.pushState({}, "Access history", "/audit");

    render(<App />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByText(/Access history/i)).toBeDefined();
      expect(screen.queryByText(/Page not found/i)).not.toBeInTheDocument();
    });
  });

  it("shows login prompt when user is unauthenticated", async () => {
    mockAuthClient.OverrideReturnValues(user, false);

    render(<App />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByText(/Enter your Blaise username and password/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Log in/i })).toBeInTheDocument();
      expect(screen.queryByText(/Manage users/i)).not.toBeInTheDocument();
    });
  });

  it("authenticates after login and renders navigation", async () => {
    mockAuthClient.OverrideReturnValues(user, false);

    render(<App />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Log in/i })).toBeInTheDocument();
    });

    mockAuthClient.OverrideReturnValues(user, true);
    fireEvent.click(screen.getByRole("button", { name: /Log in/i }));

    await waitFor(() => {
      expect(screen.queryAllByText(/Manage users/i).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(/Manage roles/i).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(/View access history/i).length).toBeGreaterThan(0);
    });
  });

  it("stays on login when login callback resolves to no user", async () => {
    mockAuthClient.OverrideReturnValues(null, false);

    render(<App />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Log in/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/Enter your Blaise username and password/i)).toBeInTheDocument();
      expect(screen.queryAllByText(/Manage users/i)).toHaveLength(0);
    });
  });

  it("stays on login when login callback throws", async () => {
    mockAuthClient.OverrideReturnValues(user, false);
    const getLoggedInUserSpy = vi
      .spyOn(AuthClient.prototype, "getLoggedInUser")
      .mockRejectedValueOnce(new Error("login callback failed"));

    render(<App />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Log in/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/Enter your Blaise username and password/i)).toBeInTheDocument();
      expect(screen.queryAllByText(/Manage users/i)).toHaveLength(0);
    });

    getLoggedInUserSpy.mockRestore();
  });

  it("clears token and returns to login when token exists but user lookup returns null", async () => {
    mockAuthClient.OverrideReturnValues(null, true);

    render(<App />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByText(/Enter your Blaise username and password/i)).toBeInTheDocument();
      expect(screen.queryByText(/Manage users/i)).not.toBeInTheDocument();
    });
  });

  it("returns to login when user lookup throws", async () => {
    mockAuthClient.OverrideReturnValues(user, true);
    const getLoggedInUserSpy = vi
      .spyOn(AuthClient.prototype, "getLoggedInUser")
      .mockRejectedValueOnce(new Error("auth lookup failed"));

    render(<App />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByText(/Enter your Blaise username and password/i)).toBeInTheDocument();
      expect(screen.queryByText(/Manage users/i)).not.toBeInTheDocument();
    });

    getLoggedInUserSpy.mockRestore();
  });

  it("logs the user out when an auth-expired browser event is emitted", async () => {
    mockAuthClient.OverrideReturnValues(user, true);

    render(<App />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.queryAllByText(/Manage users/i).length).toBeGreaterThan(0);
    });

    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT_NAME));

    await waitFor(() => {
      expect(screen.getByText(/Enter your Blaise username and password/i)).toBeInTheDocument();
      expect(screen.queryAllByText(/Manage users/i)).toHaveLength(0);
    });
  });

  it("renders page not found for an unknown route", async () => {
    window.history.pushState({}, "Not found", "/not-a-real-page");

    render(<App />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
    });
  });

  it("loads the change password route", async () => {
    window.history.pushState({}, "Change password", "/users/change-password/jake");

    render(<App />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByText(/Mock change password page/i)).toBeInTheDocument();
    });
  });

  it("loads the delete user route", async () => {
    window.history.pushState({}, "Delete user", "/users/delete/jake");

    render(<App />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByText(/Mock delete user page/i)).toBeInTheDocument();
    });
  });

  it("loads the change role route", async () => {
    window.history.pushState({}, "Change role", "/users/change-role/jake");

    render(<App />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByText(/Mock change role page/i)).toBeInTheDocument();
    });
  });

  it("loads the manage user route", async () => {
    window.history.pushState({}, "Manage user", "/users/jake");

    render(<App />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByText(/Mock manage user page/i)).toBeInTheDocument();
    });
  });

  it("loads the bulk upload route", async () => {
    window.history.pushState({}, "Bulk upload", "/users/upload");

    render(<App />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByText(/Mock bulk upload page/i)).toBeInTheDocument();
    });
  });

  it("loads the create user route", async () => {
    window.history.pushState({}, "Create user", "/users/new");

    render(<App />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByText(/Mock create new user page/i)).toBeInTheDocument();
    });
  });

  it("loads the manage roles route", async () => {
    window.history.pushState({}, "Manage roles", "/roles");

    render(<App />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByText(/Mock manage roles page/i)).toBeInTheDocument();
    });
  });

  it("loads the manage users route", async () => {
    window.history.pushState({}, "Manage users", "/users");

    render(<App />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByText(/Mock manage users page/i)).toBeInTheDocument();
    });
  });

  it("does not update state after unmount when bootstrap user lookup resolves", async () => {
    mockAuthClient.OverrideReturnValues(user, true);
    const deferredLookup = createDeferredPromise<User | null>();
    const getLoggedInUserSpy = vi
      .spyOn(AuthClient.prototype, "getLoggedInUser")
      .mockReturnValueOnce(deferredLookup.promise);
    const { unmount } = render(<App />, { wrapper: BrowserRouter });

    unmount();
    deferredLookup.resolve(user);
    await Promise.resolve();

    getLoggedInUserSpy.mockRestore();
  });

  it("does not update state after unmount when bootstrap user lookup rejects", async () => {
    mockAuthClient.OverrideReturnValues(user, true);
    const deferredLookup = createDeferredPromise<User | null>();
    const getLoggedInUserSpy = vi
      .spyOn(AuthClient.prototype, "getLoggedInUser")
      .mockReturnValueOnce(deferredLookup.promise);
    const { unmount } = render(<App />, { wrapper: BrowserRouter });

    unmount();
    deferredLookup.reject(new Error("late failure"));
    await Promise.resolve();

    getLoggedInUserSpy.mockRestore();
  });
});
