import fs from "fs";

import { BlaiseApiClient } from "blaise-api-node-client";
import { Auth } from "blaise-login-react-server";
import { ipKeyGenerator } from "express-rate-limit";
import pino from "pino";
import supertest from "supertest";
import { Mock } from "typemoq";

import { loadServerConfigFromEnv } from "./config/appConfig.js";
import createNodeServer from "./server.js";
import createLogger from "./utils/httpLogger.js";

import type * as ExpressRateLimitModule from "express-rate-limit";
import type { HttpLogger } from "pino-http";
import type { IMock } from "typemoq";

type RateLimitOptions = {
  keyGenerator?: (req: {
    headers: { forwarded?: string | string[] };
    ip?: string;
    socket: { remoteAddress?: string };
  }) => string;
};

const capturedRateLimitOptions: RateLimitOptions[] = [];
const capturedRateLimitMiddlewareCalls = {
  api: vi.fn(),
  page: vi.fn(),
};

vi.mock("express-rate-limit", async () => {
  const actual = await vi.importActual<typeof ExpressRateLimitModule>("express-rate-limit");

  return {
    ...actual,
    default: vi.fn((options: RateLimitOptions) => {
      capturedRateLimitOptions.push(options);
      const callSpy =
        capturedRateLimitOptions.length === 1
          ? capturedRateLimitMiddlewareCalls.api
          : capturedRateLimitMiddlewareCalls.page;

      return (_req: unknown, _res: unknown, next: () => void) => {
        callSpy();
        next();
      };
    }),
  };
});

const mockSecret = "super-secret-key";

process.env = Object.assign(process.env, {
  SESSION_SECRET: mockSecret,
  PROJECT_ID: "mockProjectId",
  BLAISE_API_URL: "http://blaise-api",
  SERVER_PARK: "mockServerPark",
  URL_DOMAIN: "blaise.gcp.onsdigital.uk",
  SESSION_TIMEOUT: "12h",
});

const config = loadServerConfigFromEnv();
const auth = new Auth(config);

function createServer(customAuth?: Auth): {
  server: ReturnType<typeof createNodeServer>;
  logger: pino.Logger;
} {
  const logger = pino();
  const httpLogger: HttpLogger = createLogger({ logger: logger, autoLogging: false });
  const blaiseApiMock: IMock<BlaiseApiClient> = Mock.ofType(
    BlaiseApiClient,
    undefined,
    undefined,
    "http://blaise-api",
  );

  return {
    server: createNodeServer(config, blaiseApiMock.object, customAuth ?? auth, httpLogger),
    logger,
  };
}

describe("server.ts focused coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedRateLimitOptions.length = 0;
    capturedRateLimitMiddlewareCalls.api.mockReset();
    capturedRateLimitMiddlewareCalls.page.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses authenticated username for API limiter keys", () => {
    const authDouble = {
      getToken: vi.fn(() => "token"),
      getUser: vi.fn(() => ({ name: "  Test.User+Alias@Example.Com  " })),
      middleware: (_req: unknown, _res: unknown, next: () => void) => next(),
    } as unknown as Auth;

    createServer(authDouble);

    const apiRateLimit = capturedRateLimitOptions[0];
    const key = apiRateLimit.keyGenerator?.({
      headers: { forwarded: "for=192.0.2.1" },
      ip: "127.0.0.1",
      socket: { remoteAddress: "127.0.0.1" },
    });

    expect(key).toBe("user:test.user%2Balias%40example.com");
  });

  it("parses array Forwarded headers for page limiter keys", () => {
    createServer();

    const pageRateLimit = capturedRateLimitOptions[1];
    const key = pageRateLimit.keyGenerator?.({
      headers: { forwarded: ["for=198.51.100.10", "for=203.0.113.20"] },
      socket: { remoteAddress: "127.0.0.1" },
    });

    expect(key).toBe(ipKeyGenerator("198.51.100.10"));
  });

  it("parses bracketed IPv6 Forwarded values for page limiter keys", () => {
    createServer();

    const pageRateLimit = capturedRateLimitOptions[1];
    const key = pageRateLimit.keyGenerator?.({
      headers: { forwarded: 'for="[2001:db8:cafe::17]"' },
      socket: { remoteAddress: "127.0.0.1" },
    });

    expect(key).toBe(ipKeyGenerator("2001:db8:cafe::17"));
  });

  it("parses IPv4 Forwarded values with ports after skipping unrelated parameters", () => {
    createServer();

    const pageRateLimit = capturedRateLimitOptions[1];
    const key = pageRateLimit.keyGenerator?.({
      headers: { forwarded: "proto=https;by=203.0.113.43;for=198.51.100.12:8443" },
      socket: { remoteAddress: "127.0.0.1" },
    });

    expect(key).toBe(ipKeyGenerator("198.51.100.12"));
  });

  it("falls back when Forwarded values are unknown or unusable", () => {
    createServer();

    const pageRateLimit = capturedRateLimitOptions[1];
    const forwardedUnknownKey = pageRateLimit.keyGenerator?.({
      headers: { forwarded: "proto=https;for=unknown" },
      ip: "198.51.100.77",
      socket: { remoteAddress: "127.0.0.1" },
    });
    const missingForKey = pageRateLimit.keyGenerator?.({
      headers: { forwarded: "proto=https;host=example.test" },
      socket: { remoteAddress: "203.0.113.45" },
    });

    expect(forwardedUnknownKey).toBe(ipKeyGenerator("198.51.100.77"));
    expect(missingForKey).toBe(ipKeyGenerator("203.0.113.45"));
  });

  it("falls back to forwarded header key when authenticated user lookup throws", () => {
    const authDouble = {
      getToken: vi.fn(() => {
        throw new Error("token read failure");
      }),
      getUser: vi.fn(),
      middleware: (_req: unknown, _res: unknown, next: () => void) => next(),
    } as unknown as Auth;

    createServer(authDouble);

    const apiRateLimit = capturedRateLimitOptions[0];
    const key = apiRateLimit.keyGenerator?.({
      headers: { forwarded: "for=203.0.113.99" },
      socket: { remoteAddress: "127.0.0.1" },
    });

    expect(key).toBe(ipKeyGenerator("203.0.113.99"));
  });

  it("bypasses page limiter for /api routes", async () => {
    const { server } = createServer();

    await supertest(server).get("/api/does-not-exist");

    expect(capturedRateLimitMiddlewareCalls.page).not.toHaveBeenCalled();
  });

  it("serves built client assets from /assets without invoking the page limiter", async () => {
    if (!fs.existsSync("build/client/assets")) {
      return;
    }

    const { server } = createServer();
    const [assetFileName] = fs.readdirSync("build/client/assets");

    expect(assetFileName).toBeDefined();

    const response = await supertest(server).get(`/assets/${assetFileName}`);

    expect(response.statusCode).toBe(200);
    expect(capturedRateLimitMiddlewareCalls.page).not.toHaveBeenCalled();
  });

  it("serves built root client files such as /users.csv", async () => {
    if (!fs.existsSync("build/client/users.csv")) {
      return;
    }

    const { server } = createServer();

    const response = await supertest(server).get("/users.csv");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("name,password,role");
  });

  it("falls back to root index.html when build/client/index.html is missing", async () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);
    const { server } = createServer();

    const response = await supertest(server).get("/some/unknown/route");

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("PROJECT_ID");
  });

  it("routes render errors through the global error handler", async () => {
    const { server, logger } = createServer();
    const logError = vi.spyOn(logger, "error");
    const errorLayer = (
      server as unknown as {
        router?: { stack: Array<{ handle: (...args: unknown[]) => unknown }> };
      }
    ).router?.stack.find((layer) => layer.handle.length === 4);

    expect(errorLayer).toBeDefined();

    const req = { log: logger };
    const render = vi.fn();
    const res = { render };

    errorLayer?.handle(new Error("forced template failure"), req, res, vi.fn());

    expect(render).toHaveBeenCalledWith("500.html", {});
    expect(logError).toHaveBeenCalled();
  });

  it("logs undefined errors through the global error handler", async () => {
    const { server, logger } = createServer();
    const logError = vi.spyOn(logger, "error");
    const errorLayer = (
      server as unknown as {
        router?: { stack: Array<{ handle: (...args: unknown[]) => unknown }> };
      }
    ).router?.stack.find((layer) => layer.handle.length === 4);

    expect(errorLayer).toBeDefined();

    const req = { log: logger };
    const render = vi.fn();
    const res = { render };

    errorLayer?.handle("not-an-error", req, res, vi.fn());

    expect(render).toHaveBeenCalledWith("500.html", {});
    expect(logError).toHaveBeenCalledWith("AUDIT_LOG: An undefined error occurred");
  });
});
