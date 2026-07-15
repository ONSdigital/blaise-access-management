import { type Auth } from "blaise-login-react-server";
import express, { type Request, type Response, type Router } from "express";

import type AuditLogger from "../utils/auditLogger.js";

type ClientLogLevel = "log" | "info" | "warn" | "error" | "debug";

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

type NormalisedClientLogLevel = Exclude<ClientLogLevel, "log">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isClientLogLevel(level: string): level is ClientLogLevel {
  switch (level) {
    case "log":
    case "info":
    case "warn":
    case "error":
    case "debug":
      return true;
    default:
      return false;
  }
}

function normaliseLevel(level: ClientLogLevel): NormalisedClientLogLevel {
  switch (level) {
    case "log":
    case "info":
      return "info";
    case "warn":
      return "warn";
    case "error":
      return "error";
    case "debug":
      return "debug";
  }
}

function sanitise(value: string): string {
  const withoutControlChars = Array.from(value, (character) => {
    const code = character.charCodeAt(0);

    if ((code >= 0x00 && code <= 0x1f) || code === 0x7f || code === 0x2028 || code === 0x2029) {
      return " ";
    }

    return character;
  }).join("");

  return withoutControlChars.replace(/\s+/g, " ").trim();
}

function clamp(value: string, maxLength: number): string {
  const sanitised = sanitise(value);

  if (sanitised.length <= maxLength) {
    return sanitised;
  }

  return sanitised.slice(0, maxLength);
}

function currentUserName(auth: Auth, req: Request): string {
  try {
    const user = auth.getUser(auth.getToken(req));

    if (typeof user?.name === "string" && user.name.trim() !== "") {
      return user.name.trim();
    }

    return "Unknown user";
  } catch {
    return "Unknown user";
  }
}

function buildAuditMessage(userName: string, clientLog: ClientLogPayload): string {
  const action = clamp(clientLog.message, 1500);

  return `${userName} ${action}`.trim();
}

export default function newClientLogHandler(auth: Auth, auditLogger: AuditLogger): Router {
  const router = express.Router();

  router.post("/api/client-log", auth.middleware, (req: Request, res: Response) => {
    const body = isRecord(req.body) ? req.body : {};

    if (typeof body.level !== "string") {
      return res.status(400).json({ error: "Missing level" });
    }

    if (!isClientLogLevel(body.level)) {
      return res.status(400).json({ error: "Invalid level" });
    }

    if (typeof body.message !== "string" || body.message.trim() === "") {
      return res.status(400).json({ error: "Missing message" });
    }

    const normalisedLevel = normaliseLevel(body.level);
    const clientLog: ClientLogPayload = {
      level: body.level,
      message: body.message,
      args: Array.isArray(body.args)
        ? body.args.slice(0, 20).map((arg) => clamp(String(arg), 1000))
        : undefined,
      pathname: typeof body.pathname === "string" ? clamp(body.pathname, 500) : undefined,
      href: typeof body.href === "string" ? clamp(body.href, 1000) : undefined,
      userAgent: typeof body.userAgent === "string" ? clamp(body.userAgent, 500) : undefined,
      timestamp: typeof body.timestamp === "string" ? clamp(body.timestamp, 100) : undefined,
      stack: typeof body.stack === "string" ? clamp(body.stack, 8000) : undefined,
    };

    const auditMessage = buildAuditMessage(currentUserName(auth, req), clientLog);

    if (normalisedLevel === "error") {
      auditLogger.error(req.log, auditMessage);
    } else {
      auditLogger.info(req.log, auditMessage);
    }

    return res.status(204).send();
  });

  return router;
}
