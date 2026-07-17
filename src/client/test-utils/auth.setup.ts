import React from "react";

let mockUser: unknown = null;
let mockLoggedIn = false;
let mockToken: string | null = null;

type AuthRenderChild = (user: unknown, loggedIn: boolean, logOut: () => void) => React.ReactNode;
type AuthChildren = React.ReactNode | AuthRenderChild;

class MockAuthenticate extends React.Component<{ children?: AuthChildren }> {
  static OverrideReturnValues(user: unknown, loggedIn: boolean): void {
    mockUser = user;
    mockLoggedIn = loggedIn;
  }

  render(): React.ReactNode {
    if (typeof this.props.children === "function") {
      const renderChild = this.props.children as AuthRenderChild;

      return renderChild(mockUser, mockLoggedIn, () => undefined);
    }

    return this.props.children ?? null;
  }
}

class Authenticate extends React.Component<{ children?: AuthChildren }> {
  static OverrideReturnValues(user: unknown, loggedIn: boolean): void {
    mockUser = user;
    mockLoggedIn = loggedIn;
    mockToken = loggedIn ? "mock-token" : null;
  }

  render(): React.ReactNode {
    if (typeof this.props.children === "function") {
      const renderChild = this.props.children as AuthRenderChild;

      return renderChild(mockUser, mockLoggedIn, () => undefined);
    }

    return this.props.children ?? null;
  }
}

class AuthManager {
  constructor(_options?: unknown) {}

  getToken(): string | null {
    return mockToken;
  }

  setToken(token: string | null): void {
    mockToken = token;
  }

  clearToken(): void {
    mockToken = null;
  }

  async loggedIn(): Promise<boolean> {
    return mockLoggedIn;
  }

  authHeader(): Record<string, string> {
    return { Authorization: "Bearer mock-token" };
  }
}

class AuthClient extends AuthManager {
  static OverrideReturnValues(user: unknown, loggedIn: boolean): void {
    mockUser = user;
    mockLoggedIn = loggedIn;
    mockToken = loggedIn ? "mock-token" : null;
  }

  logOut(): void {
    mockLoggedIn = false;
    mockUser = null;
    mockToken = null;
  }

  async getLoggedInUser(): Promise<unknown | null> {
    return mockLoggedIn ? mockUser : null;
  }
}

function createSessionKey(projectId: string): string {
  return `mock-session-${projectId}`;
}

const LoginForm = (props: { onAuthenticated: (token: string) => Promise<void> }) =>
  React.createElement(
    "button",
    {
      type: "button",
      onClick: () => void props.onAuthenticated(mockToken ?? "mock-token"),
    },
    "Log in",
  );

vi.mock("blaise-login-react-client", () => ({
  AuthClient,
  Authenticate,
  AuthManager,
  LoginForm,
  createSessionKey,
  MockAuthenticate,
}));
