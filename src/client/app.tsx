import {
  DefaultErrorBoundary,
  ErrorBoundary,
  Footer,
  Header,
  LoadingPanel,
  NotProductionWarning,
  Panel,
} from "blaise-design-system-react-components";
import { AuthClient, LoginForm } from "blaise-login-react-client";
import { lazy, type ReactElement, Suspense, useEffect, useEffectEvent, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";

import { AUTH_EXPIRED_EVENT_NAME } from "./api/http/axiosAuthConfig";
import { type ReturnPanel } from "./types/users.types";
import { getAuthClientConfig } from "./utils/auth";
import { isProduction } from "./utils/env";

import type { User } from "blaise-api-node-client";

const loginContentMinHeight = "67vh";
const BulkUploadUsersPage = lazy(() => {
  return import("./pages/bulkUploadUsersPage/bulkUploadUsersPage");
});
const ChangePasswordPage = lazy(() => {
  return import("./pages/changePasswordPage/changePasswordPage");
});
const ChangeRolePage = lazy(() => {
  return import("./pages/changeRolePage/changeRolePage");
});
const CreateNewUserPage = lazy(() => {
  return import("./pages/createNewUserPage/createNewUserPage");
});
const DeleteUserPage = lazy(() => {
  return import("./pages/deleteUserPage/deleteUserPage");
});
const HomePage = lazy(() => {
  return import("./pages/homePage/homePage");
});
const AuditPage = lazy(() => {
  return import("./pages/auditPage/auditPage");
});
const ManageUserPage = lazy(() => {
  return import("./pages/manageUserPage/manageUserPage");
});
const ManageRolesPage = lazy(() => {
  return import("./pages/manageRolesPage/manageRolesPage");
});
const ManageUsersPage = lazy(() => {
  return import("./pages/manageUsersPage/manageUsersPage");
});

type AppRoutesProps = {
  user: User;
  updatedPanel: ReturnPanel | null;
};

const createNavLink = (id: string | undefined, label: string, endpoint: string): ReactElement => (
  <Link
    to={endpoint}
    id={id}
    className="ons-navigation__link"
  >
    {label}
  </Link>
);

function NotFound(): ReactElement {
  return (
    <main
      id="main-content"
      className="ons-page__main ons-u-mt-l"
    >
      <div className="ons-grid">
        <div className="ons-grid__col ons-col-8@m">
          <h1>Page not found</h1>
          <p>The page you're looking for doesn't exist.</p>
          <Link to="/">Return home</Link>
        </div>
      </div>
    </main>
  );
}

function AppRoutes({ user, updatedPanel }: AppRoutesProps): ReactElement {
  return (
    <DefaultErrorBoundary>
      <Suspense fallback={<LoadingPanel />}>
        <Routes>
          <Route
            path={"/users/change-password/:user"}
            element={
              <ErrorBoundary
                errorMessageText={"Unable to load Change Password page. Please try again."}
              >
                <ChangePasswordPage currentUser={user} />
              </ErrorBoundary>
            }
          />
          <Route
            path={"/users/delete/:user"}
            element={<DeleteUserPage />}
          />
          <Route
            path="/users/change-role/:user"
            element={
              <ErrorBoundary
                errorMessageText={"Unable to load Change Role page. Please try again."}
              >
                <ChangeRolePage currentUser={user} />
              </ErrorBoundary>
            }
          />
          <Route
            path="/users/:user"
            element={
              <ErrorBoundary
                errorMessageText={"Unable to load User Profile Page. Please try again."}
              >
                <ManageUserPage
                  currentUser={user}
                  updatedPanel={updatedPanel}
                />
              </ErrorBoundary>
            }
          />
          <Route
            path={"/users/upload"}
            element={<BulkUploadUsersPage />}
          />
          <Route
            path={"/users/new"}
            element={<CreateNewUserPage />}
          />
          <Route
            path="/users"
            element={
              <ErrorBoundary errorMessageText={"Unable to load users table. Please try again."}>
                <ManageUsersPage
                  currentUser={user}
                  updatedPanel={updatedPanel}
                />
              </ErrorBoundary>
            }
          />
          <Route
            path="/audit"
            element={
              <ErrorBoundary errorMessageText={"Unable to load access history. Please try again."}>
                <AuditPage />
              </ErrorBoundary>
            }
          />
          <Route
            path={"/roles"}
            element={
              <ErrorBoundary errorMessageText={"Unable to load roles table. Please try again."}>
                <ManageRolesPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/"
            element={
              <ErrorBoundary errorMessageText={"Unable to load homepage. Please try again."}>
                <HomePage />
              </ErrorBoundary>
            }
          />
          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
      </Suspense>
    </DefaultErrorBoundary>
  );
}

function App(): ReactElement {
  const location = useLocation();
  const updatedPanel = ((location.state as { updatedPanel?: ReturnPanel } | null)?.updatedPanel ??
    null) as ReturnPanel | null;
  const [authClient] = useState(() => new AuthClient(getAuthClientConfig()));
  const [authState, setAuthState] = useState<"checking" | "unauthenticated" | "authenticated">(
    () => (authClient.getToken() == null ? "unauthenticated" : "checking"),
  );
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  function clearSession(): void {
    authClient.logOut();
    setCurrentUser(null);
    setAuthState("unauthenticated");
  }

  const clearSessionEffect = useEffectEvent(clearSession);

  async function handleAuthenticated(token: string): Promise<void> {
    authClient.setToken(token);
    setAuthState("checking");

    try {
      const user = await authClient.getLoggedInUser();

      if (!user) {
        clearSession();

        return;
      }

      setCurrentUser(user);
      setAuthState("authenticated");
    } catch {
      clearSession();
    }
  }

  useEffect(() => {
    if (authClient.getToken() == null) {
      return;
    }

    let cancelled = false;

    void authClient
      .getLoggedInUser()
      .then((user) => {
        if (cancelled) {
          return;
        }

        if (!user) {
          authClient.clearToken();
          setCurrentUser(null);
          setAuthState("unauthenticated");

          return;
        }

        setCurrentUser(user);
        setAuthState("authenticated");
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        authClient.clearToken();
        setCurrentUser(null);
        setAuthState("unauthenticated");
      });

    return () => {
      cancelled = true;
    };
  }, [authClient]);

  useEffect(() => {
    const onAuthExpired = () => {
      clearSessionEffect();
    };

    window.addEventListener(AUTH_EXPIRED_EVENT_NAME, onAuthExpired);

    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT_NAME, onAuthExpired);
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <a
        href="#main-content"
        className="ons-skip-to-content ons-u-fs-r--b"
      >
        Skip to content
      </a>
      {!isProduction(window.location.hostname) && <NotProductionWarning />}
      <Header
        title={"Blaise Access Management"}
        signOutButton={authState === "authenticated"}
        noSave={true}
        signOutFunction={clearSession}
        navigationLinks={
          authState === "authenticated"
            ? [
                {
                  id: "home-link",
                  label: "Home",
                  endpoint: "/",
                },
                {
                  id: "users-link",
                  label: "Manage users",
                  endpoint: "/users",
                },
                {
                  id: "roles-link",
                  label: "Manage roles",
                  endpoint: "/roles",
                },
                {
                  id: "audit-link",
                  label: "View access history",
                  endpoint: "/audit",
                },
              ]
            : []
        }
        currentLocation={location.pathname}
        createNavLink={createNavLink}
      />
      <div
        style={{
          flexGrow: 1,
          minHeight: authState === "authenticated" ? undefined : loginContentMinHeight,
        }}
        className="ons-page__container ons-container"
      >
        <DefaultErrorBoundary>
          {authState === "checking" && (
            <div id="main-content">
              <LoadingPanel />
            </div>
          )}
          {authState === "unauthenticated" && (
            <div id="main-content">
              <Panel status="info">Enter your Blaise username and password</Panel>
              <LoginForm onAuthenticated={handleAuthenticated} />
            </div>
          )}
          {authState === "authenticated" && currentUser && (
            <AppRoutes
              user={currentUser}
              updatedPanel={updatedPanel}
            />
          )}
        </DefaultErrorBoundary>
      </div>
      <Footer />
    </div>
  );
}

export default App;
