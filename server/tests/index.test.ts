/**
 * @jest-environment node
 */

import app from "../server"; // Link to your server file
import supertest from "supertest";

// Temporary fix for Jest open handle issue (gcp profiler TCPWRAP error)
jest.mock("@google-cloud/profiler", () => ({
    start: jest.fn().mockReturnValue(Promise.resolve())
}));

const request = supertest(app);

describe("Test Heath Endpoint", () => {
    it("should return a 200 status and json message", async () => {
        const response = await request.get("/bam-ui/version/health");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toStrictEqual({ healthy: true });
    });
});

describe("app engine start", () => {
    it("should return a 200 status and json message", async () => {
        process.env = Object.assign({
            PROJECT_ID: "mock",
            BLAISE_API_URL: "http://mock",
            SERVER_PARK: "mock",
            SESSION_TIMEOUT: "12h"
        });

        const response = await request.get("/_ah/start");

        expect(response.statusCode).toEqual(200);
    });
});
