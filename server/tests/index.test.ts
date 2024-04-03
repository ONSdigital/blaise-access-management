import app from "../server"; // Link to your server file
import supertest from "supertest";
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
        const response = await request.get("/_ah/start");

        expect(response.statusCode).toEqual(200);
    });
});
