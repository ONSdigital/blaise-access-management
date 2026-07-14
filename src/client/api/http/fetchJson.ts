import { createAuthManager } from "../../utils/auth";

import { notifyAuthExpiredIfNeeded } from "./axiosAuthConfig";

type HeadersObject = Record<string, string>;

async function fetchJson(
  method: string,
  url: string,
  body: FormData | null = null,
  headers: HeadersObject = {},
): Promise<[number, JSON]> {
  const authManager = createAuthManager();

  try {
    const response = await fetch(url, {
      method,
      body,
      headers: Object.assign({}, headers, authManager.authHeader()),
    });

    notifyAuthExpiredIfNeeded(response.status);

    if (response.status === 204) {
      return [response.status, JSON.parse("{}")];
    } else {
      const data = await response.json();

      return [response.status, data];
    }
  } catch {
    return [0, JSON.parse("{}")];
  }
}

async function fetchJsonList<T>(method: string, url: string, body = null): Promise<[boolean, T[]]> {
  const authManager = createAuthManager();

  try {
    const response = await fetch(url, {
      method,
      body,
      headers: authManager.authHeader(),
    });

    notifyAuthExpiredIfNeeded(response.status);

    const data = await response.json();

    if (response.status === 200) {
      if (!Array.isArray(data)) {
        return [false, []];
      }

      return [true, data];
    } else if (response.status === 404) {
      return [true, data];
    } else {
      return [false, []];
    }
  } catch {
    return [false, []];
  }
}

export { fetchJson, fetchJsonList };
