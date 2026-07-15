import axios from "axios";

import { getAxiosAuthConfig } from "../api/http/axiosAuthConfig";

export type ClientLogLevel = "log" | "info" | "warn" | "error" | "debug";

interface ClientLogPayload {
  level: ClientLogLevel;
  message: string;
  args?: string[];
  pathname?: string;
  href?: string;
  userAgent?: string;
  timestamp?: string;
  stack?: string;
}

function safeStringify(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Error) {
    return value.stack || value.message || "Error";
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export async function sendClientLog(level: ClientLogLevel, ...args: unknown[]): Promise<void> {
  const message = args.length > 0 ? safeStringify(args[0]) : "";

  if (message.trim() === "") {
    return;
  }

  const payload: ClientLogPayload = {
    level,
    message,
    args: args.slice(1, 21).map(safeStringify),
    pathname: typeof window !== "undefined" ? window.location.pathname : undefined,
    href: typeof window !== "undefined" ? window.location.href : undefined,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    timestamp: new Date().toISOString(),
    stack:
      args.find((arg) => arg instanceof Error) instanceof Error
        ? (args.find((arg) => arg instanceof Error) as Error).stack
        : undefined,
  };

  try {
    await axios.post("/api/client-log", payload, getAxiosAuthConfig());
  } catch {
    // ignore logging failures so they never impact user actions
  }
}
