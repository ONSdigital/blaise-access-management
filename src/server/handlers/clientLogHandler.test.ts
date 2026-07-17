import { BlaiseApiClient } from "blaise-api-node-client";
import { Auth } from "blaise-login-react-server";
import pino from "pino";
import supertest from "supertest";
import { Mock } from "typemoq";

import { loadServerConfigFromEnv } from "../config/appConfig.js";
import createNodeServer from "../server.js";
import createLogger from "../utils/httpLogger.js";

import type { HttpLogger } from "pino-http";
import type { IMock } from "typemoq";

process.env = Object.assign(process.env, {
  SESSION_SECRET: "test-secret",
  PROJECT_ID: "mockProjectId",
  BLAISE_API_URL: "http://blaise-api",
  SERVER_PARK: "mockServerPark",
  URL_DOMAIN: "blaise.gcp.onsdigital.uk",
  SESSION_TIMEOUT: "12h",
});

const config = loadServerConfigFromEnv();
const auth = new Auth(config);

const logger: pino.Logger = pino();
const httpLogger: HttpLogger = createLogger({ logger, autoLogging: false });

const blaiseApiMock: IMock<BlaiseApiClient> = Mock.ofType(
  BlaiseApiClient,
  undefined,
  undefined,
  "http://blaise-api",
);

const mockUser = {
  name: "testUser",
  role: "DST",
  defaultServerPark: "park1",
  serverParks: ["park1"],
};
const authToken = auth.signToken(mockUser);

const server = createNodeServer(config, blaiseApiMock.object, auth, httpLogger);
const sut = supertest(server);

describe("POST /api/client-log", () => {
  it("returns 204 for a valid info log payload", async () => {
    const response = await sut
      .post("/api/client-log")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ level: "info", message: "Hello from client" });

    expect(response.status).toBe(204);
  });

  it("returns 204 for a valid error log payload", async () => {
    const response = await sut
      .post("/api/client-log")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ level: "error", message: "Something went wrong" });

    expect(response.status).toBe(204);
  });

  it("returns 204 for a valid debug log payload", async () => {
    const response = await sut
      .post("/api/client-log")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ level: "debug", message: "Debug info" });

    expect(response.status).toBe(204);
  });

  it("returns 204 for a valid warn log payload", async () => {
    const response = await sut
      .post("/api/client-log")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ level: "warn", message: "A warning" });

    expect(response.status).toBe(204);
  });

  it("returns 204 for a valid 'log' level (normalised to info)", async () => {
    const response = await sut
      .post("/api/client-log")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ level: "log", message: "A log entry" });

    expect(response.status).toBe(204);
  });

  it("returns 400 when level is missing", async () => {
    const response = await sut
      .post("/api/client-log")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ message: "No level" });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Missing level/i);
  });

  it("returns 400 when level is invalid", async () => {
    const response = await sut
      .post("/api/client-log")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ level: "verbose", message: "Bad level" });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Invalid level/i);
  });

  it("returns 400 when message is missing", async () => {
    const response = await sut
      .post("/api/client-log")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ level: "info" });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Missing message/i);
  });

  it("returns 400 when message is blank whitespace", async () => {
    const response = await sut
      .post("/api/client-log")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ level: "info", message: "   " });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Missing message/i);
  });

  it("returns 400 when body is not a JSON object (it is a non-object)", async () => {
    const response = await sut
      .post("/api/client-log")
      .set("Authorization", `Bearer ${authToken}`)
      .set("Content-Type", "application/json")
      .send(JSON.stringify(["array", "value"]));

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Missing level/i);
  });

  it("accepts optional fields (args, pathname, href, etc.)", async () => {
    const response = await sut
      .post("/api/client-log")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        level: "info",
        message: "Test with extras",
        args: ["arg1", "arg2"],
        pathname: "/some/path",
        href: "https://example.com/some/path",
        userAgent: "TestBrowser/1.0",
        timestamp: "2024-01-01T00:00:00.000Z",
        stack: "Error: test\n  at test.ts:1:1",
      });

    expect(response.status).toBe(204);
  });

  it("returns 403 when no auth token is provided", async () => {
    const response = await sut
      .post("/api/client-log")
      .send({ level: "info", message: "Unauthenticated request" });

    expect(response.status).toBe(403);
  });

  it("truncates very long messages (clamp function)", async () => {
    const longMessage = "x".repeat(2000);

    const response = await sut
      .post("/api/client-log")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ level: "info", message: longMessage });

    expect(response.status).toBe(204);
  });

  it("uses 'Unknown user' when the authenticated user has an empty name", async () => {
    const emptyNameToken = auth.signToken({
      name: "",
      role: "DST",
      defaultServerPark: "park1",
      serverParks: ["park1"],
    });

    const response = await sut
      .post("/api/client-log")
      .set("Authorization", `Bearer ${emptyNameToken}`)
      .send({ level: "info", message: "Empty name test" });

    expect(response.status).toBe(204);
  });
});
