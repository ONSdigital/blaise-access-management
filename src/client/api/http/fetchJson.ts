import { createAuthManager } from "../../utils/auth";

import { notifyAuthExpiredIfNeeded } from "./axiosAuthConfig";

type HeadersObject = Record<string, string>;

export interface ApiResponse<TData = unknown> {
  success: boolean;
  status: number;
  data: TData;
  message: string;
  error?: unknown;
}

export type FetchJsonResponse<TData = unknown> = ApiResponse<TData>;

export type FetchJsonListResponse<TData> = ApiResponse<TData[]>;

function getMessageFromPayload(data: unknown, fallbackMessage: string): string {
  if (typeof data === "object" && data !== null && "message" in data) {
    const message = (data as { message?: unknown }).message;

    if (typeof message === "string" && message.trim() !== "") {
      return message;
    }
  }

  return fallbackMessage;
}

async function fetchJson(
  method: string,
  url: string,
  body: BodyInit | null = null,
  headers: HeadersObject = {},
): Promise<FetchJsonResponse<unknown>> {
  const authManager = createAuthManager();

  const response = await fetch(url, {
    method,
    body,
    headers: Object.assign({}, headers, authManager.authHeader()),
  });

  notifyAuthExpiredIfNeeded(response.status);

  const success = response.status >= 200 && response.status < 300;

  if (response.status === 204) {
    return {
      success,
      status: response.status,
      data: {},
      message: "Request completed",
    };
  }

  const data = await response.json();

  return {
    success,
    status: response.status,
    data,
    message: getMessageFromPayload(data, success ? "Request completed" : "Request failed"),
  };
}

async function fetchJsonList<T>(
  method: string,
  url: string,
  body: BodyInit | null = null,
): Promise<FetchJsonListResponse<T>> {
  const response = await fetchJson(method, url, body);

  if (!response.success || response.status !== 200) {
    return {
      success: false,
      status: response.status,
      data: [],
      message: response.message,
      error: response.error,
    };
  }

  if (!Array.isArray(response.data)) {
    return {
      success: false,
      status: response.status,
      data: [],
      message: "Request failed",
      error: new Error("Expected list response"),
    };
  }

  return {
    success: true,
    status: response.status,
    data: response.data,
    message: response.message,
  };
}

export { fetchJson, fetchJsonList };
