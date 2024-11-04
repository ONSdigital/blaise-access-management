/**
 * @jest-environment node
 */

import supertest from "supertest";
import GetNodeServer from "../server";
import BlaiseApiClient from "blaise-api-node-client";
import { Auth } from "blaise-login-react/blaise-login-react-server";
import { IMock, Mock } from "typemoq";
import pino from "pino";
import { HttpLogger } from "pino-http";
import { loadConfigFromEnv } from "../Config";
// eslint-disable-next-line import/no-extraneous-dependencies
import createLogger from "../logger/pinoLogger";

// Temporary fix for Jest open handle issue (gcp profiler TCPWRAP error)
jest.mock("@google-cloud/profiler", () => ({
    start: jest.fn().mockReturnValue(Promise.resolve())
}));

const mockSecret = "super-secret-key";
process.env = Object.assign(process.env, {
    SESSION_SECRET: mockSecret,
    PROJECT_ID: "mockProjectId",
    BLAISE_API_URL: "http://blaise-api",
    SERVER_PARK: "mockServerPark",
    SESSION_TIMEOUT: "12h"
});
const config = loadConfigFromEnv();
const auth = new Auth(config);

const logger: pino.Logger = pino();
logger.child = jest.fn(() => logger);
const logInfo = jest.spyOn(logger, "info");
const httpLogger: HttpLogger = createLogger({ logger: logger });

const blaiseApiMock: IMock<BlaiseApiClient> = Mock.ofType(BlaiseApiClient);

const server = GetNodeServer(config, blaiseApiMock.object, auth, httpLogger);
const sut = supertest(server);

describe("GCP health check", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return a 200 status and json message", async () => {
        const response = await sut.get("/bam-ui/version/health");

        const log = logInfo.mock.calls[0][0];
        expect(log).toEqual("AUDIT_LOG: Heath Check endpoint called");
        expect(response.statusCode).toEqual(200);
        expect(response.body).toStrictEqual({ healthy: true });
    });
});

describe("GCP app engine start", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return a 200 status and json message", async () => {
        process.env = Object.assign({
            PROJECT_ID: "mockProjectId",
            BLAISE_API_URL: "http://blaise-api",
            SERVER_PARK: "mockServerPark",
            SESSION_TIMEOUT: "12h"
        });

        const response = await sut.get("/_ah/start");

        expect(response.statusCode).toEqual(200);
    });
});