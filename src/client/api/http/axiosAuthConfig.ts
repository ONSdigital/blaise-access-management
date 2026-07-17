import axios, { type AxiosRequestConfig } from "axios";
import { AuthManager } from "blaise-login-react-client";

import { getAuthClientConfig } from "../../utils/auth";

export const AUTH_EXPIRED_EVENT_NAME = "bam-auth-expired";

const authManager = new AuthManager(getAuthClientConfig());

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getResponseStatus(error: unknown): number | undefined {
  if (!isRecord(error)) {
    return undefined;
  }

  const { response } = error;

  return isRecord(response) && typeof response.status === "number" ? response.status : undefined;
}

function notifyAuthExpired(): void {
  authManager.clearToken();
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT_NAME));
}

function ensureAuthExpiryInterceptor(): void {
  axios.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      const status = getResponseStatus(error);

      if ((status === 401 || status === 403) && authManager.getToken() != null) {
        notifyAuthExpired();
      }

      throw error;
    },
  );
}

ensureAuthExpiryInterceptor();

export function notifyAuthExpiredIfNeeded(status: number | undefined): void {
  if ((status === 401 || status === 403) && authManager.getToken() != null) {
    notifyAuthExpired();
  }
}

export function getAxiosAuthConfig(): AxiosRequestConfig {
  return {
    headers: {
      ...authManager.authHeader(),
    },
  };
}
