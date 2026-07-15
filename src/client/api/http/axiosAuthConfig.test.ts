import axios from "axios";
import { AuthClient } from "blaise-login-react-client";

import {
  AUTH_EXPIRED_EVENT_NAME,
  getAxiosAuthConfig,
  notifyAuthExpiredIfNeeded,
} from "./axiosAuthConfig";

// The auth module mock (setupTests) provides AuthManager whose getToken() returns the
// module-level mockToken. We must call AuthClient.OverrideReturnValues(user, true)
// before tests that rely on getToken() returning a non-null value.

type TestAuthClient = typeof AuthClient & {
  OverrideReturnValues: (user: unknown, loggedIn: boolean) => void;
};
const mockAuthClient = AuthClient as unknown as TestAuthClient;

type InterceptorHandler = {
  fulfilled?: (value: unknown) => unknown;
  rejected?: (error: unknown) => Promise<unknown>;
};

type ResponseInterceptorManager = {
  handlers?: InterceptorHandler[];
  _handlers?: InterceptorHandler[];
};

function getLatestResponseInterceptor(): InterceptorHandler | undefined {
  const manager = axios.interceptors.response as unknown as ResponseInterceptorManager;
  const handlers = manager.handlers ?? manager._handlers ?? [];

  return (
    handlers.findLast?.((handler) => Boolean(handler?.rejected)) ?? handlers[handlers.length - 1]
  );
}

describe("getAxiosAuthConfig", () => {
  it("returns AxiosRequestConfig with the auth header", () => {
    const config = getAxiosAuthConfig();

    expect(config.headers).toMatchObject({ Authorization: "Bearer mock-token" });
  });
});

describe("notifyAuthExpiredIfNeeded", () => {
  const dispatchSpy = vi.spyOn(window, "dispatchEvent");

  beforeEach(() => {
    dispatchSpy.mockClear();
    // Ensure a token is present so the 401/403 condition is satisfied
    mockAuthClient.OverrideReturnValues({ name: "user" }, true);
  });

  it("dispatches auth-expired event when status is 401 and token is present", () => {
    notifyAuthExpiredIfNeeded(401);

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: AUTH_EXPIRED_EVENT_NAME }),
    );
  });

  it("dispatches auth-expired event when status is 403 and token is present", () => {
    notifyAuthExpiredIfNeeded(403);

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: AUTH_EXPIRED_EVENT_NAME }),
    );
  });

  it("does not dispatch when status is 200", () => {
    notifyAuthExpiredIfNeeded(200);

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it("does not dispatch when status is undefined", () => {
    notifyAuthExpiredIfNeeded(undefined);

    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});

describe("axios response interceptor (ensureAuthExpiryInterceptor)", () => {
  const dispatchSpy = vi.spyOn(window, "dispatchEvent");

  beforeEach(() => {
    dispatchSpy.mockClear();
    mockAuthClient.OverrideReturnValues({ name: "user" }, true);
  });

  it("throws the error so callers still get it", async () => {
    const handler = getLatestResponseInterceptor();
    const rejectedFn = handler?.rejected;
    const fulfilledFn = handler?.fulfilled;

    if (!rejectedFn) {
      return;
    }

    if (fulfilledFn) {
      const fakeResponse = { status: 200, data: "ok" };
      const result = fulfilledFn(fakeResponse);

      expect(result).toBe(fakeResponse);
    }

    const fakeError = { response: { status: 200 } };

    await expect(rejectedFn(fakeError)).rejects.toBe(fakeError);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it("dispatches auth-expired event via interceptor when a 401 axios error occurs", async () => {
    const handler = getLatestResponseInterceptor();
    const rejectedFn = handler?.rejected;

    if (!rejectedFn) {
      return;
    }

    const fakeError = { response: { status: 401 } };

    await expect(rejectedFn(fakeError)).rejects.toBe(fakeError);
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: AUTH_EXPIRED_EVENT_NAME }),
    );
  });

  it("handles non-record error in interceptor (getResponseStatus returns undefined)", async () => {
    const handler = getLatestResponseInterceptor();
    const rejectedFn = handler?.rejected;

    if (!rejectedFn) {
      return;
    }

    const nonRecordError = "plain string error";

    await expect(rejectedFn(nonRecordError)).rejects.toBe(nonRecordError);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});
