import fs from "fs";
import path from "path";

import axios from "axios";
import { newLoginHandler } from "blaise-login-react-server";
import ejs from "ejs";
import express from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import helmet from "helmet";
import multer from "multer";

import blaiseApi from "./handlers/blaiseApi.js";
import newClientLogHandler from "./handlers/clientLogHandler.js";
import AuditLogger from "./utils/auditLogger.js";

import type { CustomConfig } from "./types/server.types.js";
import type { BlaiseApiClient } from "blaise-api-node-client";
import type { Auth } from "blaise-login-react-server";
import type { Express, NextFunction, Request, Response } from "express";
import type { HttpLogger } from "pino-http";

const DEFAULT_API_RATE_LIMIT = 3000;
const DEFAULT_PAGE_RATE_LIMIT = 1000;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

function parseRateLimit(envName: string, fallback: number): number {
  const value = process.env[envName];

  if (value == null || value.trim() === "") {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function normaliseForwardedForValue(forwardedForValue: string): string | null {
  const trimmedValue = forwardedForValue.trim().replace(/^"|"$/g, "");

  if (!trimmedValue || trimmedValue.toLowerCase() === "unknown") {
    return null;
  }

  if (trimmedValue.startsWith("[")) {
    const closingBracketIndex = trimmedValue.indexOf("]");

    return closingBracketIndex > 1 ? trimmedValue.slice(1, closingBracketIndex) : null;
  }

  const parts = trimmedValue.split(":");

  if (parts.length === 2 && trimmedValue.includes(".")) {
    return parts[0];
  }

  return trimmedValue;
}

function forwardedHeaderForValue(forwardedHeaderValue: string): string | null {
  for (const entry of forwardedHeaderValue.split(",")) {
    for (const parameter of entry.split(";")) {
      const [parameterName, parameterValue] = parameter.split("=");

      if (parameterName?.trim().toLowerCase() !== "for" || !parameterValue) {
        continue;
      }

      const normalisedValue = normaliseForwardedForValue(parameterValue);

      if (normalisedValue) {
        return normalisedValue;
      }
    }
  }

  return null;
}

function keyGeneratorFromForwardedHeader(req: Request): string {
  const forwardedHeaderValue = req.headers.forwarded;
  const combinedHeaderValue = Array.isArray(forwardedHeaderValue)
    ? forwardedHeaderValue.join(",")
    : forwardedHeaderValue;

  const forwardedFor = combinedHeaderValue ? forwardedHeaderForValue(combinedHeaderValue) : null;

  return ipKeyGenerator(forwardedFor ?? req.ip ?? req.socket.remoteAddress ?? "unknown");
}

function userRateLimitKey(auth: Auth, req: Request): string | null {
  try {
    const token = auth.getToken(req);
    const userName = auth.getUser(token)?.name;

    if (typeof userName !== "string") {
      return null;
    }

    const normalisedUserName = userName.trim().toLowerCase();

    if (normalisedUserName === "") {
      return null;
    }

    return `user:${encodeURIComponent(normalisedUserName)}`;
  } catch {
    return null;
  }
}

function keyGeneratorFromAuthenticatedUser(auth: Auth, req: Request): string {
  return userRateLimitKey(auth, req) ?? keyGeneratorFromForwardedHeader(req);
}

function createApiRateLimiter(auth: Auth) {
  return rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    limit: parseRateLimit("BAM_API_RATE_LIMIT", DEFAULT_API_RATE_LIMIT),
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: (req: Request) => keyGeneratorFromAuthenticatedUser(auth, req),
    message: { error: "Too many requests, please try again later" },
  });
}

function createAppConfigJson(config: CustomConfig): string {
  const appConfig = {
    PROJECT_ID: config.ProjectId,
    URL_DOMAIN: config.URLDomain,
    DEFAULT_SERVER_PARK: config.RoleToServerParksMap["DEFAULT"]?.[0] ?? config.ServerPark,
    ROLE_TO_SERVER_PARKS_MAP: config.RoleToServerParksMap,
  };

  // Prevent accidentally closing the script tag from JSON content.
  return JSON.stringify(appConfig).replace(/</g, "\\u003c");
}

export default function GetNodeServer(
  config: CustomConfig,
  blaiseApiClient: BlaiseApiClient,
  auth: Auth,
  logger: HttpLogger,
): Express {
  const auditLogger = new AuditLogger(config.ProjectId);
  const pinoLogger = logger;
  const upload = multer();
  const server = express();
  const apiRateLimiter = createApiRateLimiter(auth);
  const pageRateLimiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    limit: parseRateLimit("BAM_PAGE_RATE_LIMIT", DEFAULT_PAGE_RATE_LIMIT),
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: keyGeneratorFromForwardedHeader,
    message: { error: "Too many requests, please try again later" },
  });

  server.disable("x-powered-by");
  server.set("trust proxy", 1);

  server.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.ons.gov.uk"],
          fontSrc: ["'self'", "https://cdn.ons.gov.uk", "data:"],
          imgSrc: ["'self'", "https://cdn.ons.gov.uk", "data:"],
          connectSrc: ["'self'"],
          manifestSrc: ["'self'", "https://cdn.ons.gov.uk"],
        },
      },
    }),
  );

  server.use(upload.any());
  server.use(pinoLogger);
  server.use((req, res, next) => {
    if (req.path.startsWith("/api/") || req.path.startsWith("/static/")) {
      return next();
    }

    return pageRateLimiter(req, res, next);
  });

  axios.defaults.timeout = 10000;

  const loginRouter = newLoginHandler(auth, blaiseApiClient);
  const blaiseApiRouter = blaiseApi(config, auth, blaiseApiClient, auditLogger);
  const clientLogRouter = newClientLogHandler(auth, auditLogger);

  // GCP health check
  server.get("/bam-ui/:version/health", async function (req: Request, res: Response) {
    auditLogger.info(req.log, "Heath Check endpoint called");
    res.status(200).json({ healthy: true });
  });
  server.use("/", loginRouter);
  server.use("/", apiRateLimiter, clientLogRouter);
  server.use("/", apiRateLimiter, blaiseApiRouter);

  // treat the index.html as a template and substitute the values at runtime
  server.set("views", path.join(process.cwd(), "src/server/views"));
  server.engine("html", ejs.renderFile);
  server.use("/static", express.static(path.join(process.cwd(), "build/client/static")));

  let indexFilePath = path.join(process.cwd(), "build/client/index.html");

  if (!fs.existsSync(indexFilePath)) {
    indexFilePath = path.join(process.cwd(), "index.html");
  }

  server.get(/.*/, function (_req: Request, res: Response) {
    res.render(indexFilePath, {
      appConfigJson: createAppConfigJson(config),
    });
  });

  server.use(function (err: unknown, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof Error && err.stack) {
      auditLogger.error(_req.log, err.stack);
      console.error(err.stack);
    } else {
      auditLogger.error(_req.log, "An undefined error occurred");
      console.error("An undefined error occurred");
    }

    res.render("500.html", {});
  });

  return server;
}
