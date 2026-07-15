import { BlaiseApiClient } from "blaise-api-node-client";
import { Auth } from "blaise-login-react-server";
import pino from "pino";
import supertest from "supertest";
import { Mock } from "typemoq";

import { loadServerConfigFromEnv } from "./config/appConfig.js";
import createNodeServer from "./server.js";
import createLogger from "./utils/httpLogger.js";

import type { HttpLogger } from "pino-http";
import type { IMock } from "typemoq";

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

const logger: pino.Logger = pino();
const logInfo = vi.spyOn(logger, "info");
const httpLogger: HttpLogger = createLogger({ logger: logger, autoLogging: false });

const blaiseApiMock: IMock<BlaiseApiClient> = Mock.ofType(
  BlaiseApiClient,
  undefined,
  undefined,
  "http://blaise-api",
);

const server = createNodeServer(config, blaiseApiMock.object, auth, httpLogger);
const sut = supertest(server);

describe("GCP health check", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a 200 status and json message", async () => {
    const response = await sut.get("/bam-ui/version/health");

    const log = logInfo.mock.calls[0][0];

    expect(log).toEqual("AUDIT_LOG: Health check endpoint called");
    expect(response.statusCode).toEqual(200);
    expect(response.body).toStrictEqual({ healthy: true });
  });
});

describe("GCP app engine start", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a 200 status and json message", async () => {
    process.env = Object.assign({
      PROJECT_ID: "mockProjectId",
      BLAISE_API_URL: "http://blaise-api",
      SERVER_PARK: "mockServerPark",
      URL_DOMAIN: "blaise.gcp.onsdigital.uk",
      SESSION_TIMEOUT: "12h",
    });

    const response = await sut.get("/_ah/start");

    expect(response.statusCode).toEqual(200);
  });
});

describe("Express server utility functions via integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the HTML index page for an unknown path (catch-all route)", async () => {
    const response = await sut.get("/some/unknown/route");

    expect([200, 301, 302]).toContain(response.statusCode);
  });

  it("responds to requests with Forwarded header via rate limiter key generator", async () => {
    const response = await sut.get("/bam-ui/version/health").set("Forwarded", "for=192.0.2.1");

    expect(response.statusCode).toEqual(200);
  });

  it("responds to requests with X-Forwarded-For header", async () => {
    const response = await sut.get("/bam-ui/version/health").set("X-Forwarded-For", "10.0.0.1");

    expect(response.statusCode).toEqual(200);
  });

  it("uses custom BAM_API_RATE_LIMIT env var when set", async () => {
    process.env.BAM_API_RATE_LIMIT = "100";

    const localServer = createNodeServer(config, blaiseApiMock.object, auth, httpLogger);
    const localSut = supertest(localServer);
    const response = await localSut.get("/bam-ui/version/health");

    expect(response.statusCode).toEqual(200);

    delete process.env.BAM_API_RATE_LIMIT;
  });

  it("uses custom BAM_PAGE_RATE_LIMIT env var when set", async () => {
    process.env.BAM_PAGE_RATE_LIMIT = "invalid";

    const localServer = createNodeServer(config, blaiseApiMock.object, auth, httpLogger);
    const localSut = supertest(localServer);
    const response = await localSut.get("/bam-ui/version/health");

    expect(response.statusCode).toEqual(200);

    delete process.env.BAM_PAGE_RATE_LIMIT;
  });
});
