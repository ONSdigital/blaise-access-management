/**
 * @jest-environment node
 */

import { server, blaiseApiClient, authMock } from "../server"; // Link to your server file
import supertest from "supertest";
import { AuthManager } from "blaise-login-react/blaise-login-react-client";
import axios from "axios";

// Temporary fix for Jest open handle issue (gcp profiler TCPWRAP error)
jest.mock("@google-cloud/profiler", () => ({
    start: jest.fn().mockReturnValue(Promise.resolve())
}));

const request = supertest(server);

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


import role_to_serverparks_map from '../role-to-serverparks-map.json'
import { Times } from "typemoq";
//import { Auth } from "blaise-login-react/blaise-login-react-server";

import BlaiseApiClient, { NewUser } from "blaise-api-node-client";
import { promiseImpl } from "ejs";
jest.mock('blaise-api-node-client');


describe("Test /api/users POST createUser with correct server parks", () => {
    it("should return a 200 status and json message", async () => {
        const roleName = "IPS Field Interviewer"
        const spmap = role_to_serverparks_map[roleName]
        //jest.spyOn(blaiseApiClient, "createUser").mockImplementation(async () => promiseImpl<NewUser>());
        /*
        const mock = jest.spyOn(blaiseApiClient, 'createUser');  // spy on foo
        const newUser : NewUser = {
            name:  "name1",
            password: "password1",
            role: "test-user-role",
            serverParks: ["sp1", "sp2"],
            defaultServerPark: "sp1"
        };
        mock.mockImplementation(() => Promise.resolve(newUser))
        */
        //BlaiseApiClient.createUser.mockReturnValue = null;
        //c.createUser.mo

        /*
        const authManager = new AuthManager();
        const authHeader = authManager.authHeader();
        axios.post("/api/users", {
            headers: authHeader
          });
        */
        const response = await request.post("/api/users")
            .field("role", roleName);
            //.field("Authorization", "TEST123");

        expect(response.statusCode).toEqual(200);
        //blaiseApiClientMock.verify(a => a.createUser, Times.exactly(1));
        //let param1  = blaiseApiClientMock_interceptor._interceptorContext._actualInvocations[0].args[0];
        expect(response.body).toStrictEqual({ healthy: true });
    });
});
