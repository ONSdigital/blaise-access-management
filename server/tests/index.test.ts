/**
 * @jest-environment node
 */

import supertest from "supertest";
import GetNodeServer from "../server";
import { loadConfigFromEnv } from "../Config";
import BlaiseApiClient from "blaise-api-node-client";
import { Auth } from "blaise-login-react/blaise-login-react-server";
import { IMock, Mock, It, Times  } from "typemoq";

// Temporary fix for Jest open handle issue (gcp profiler TCPWRAP error)
jest.mock("@google-cloud/profiler", () => ({
    start: jest.fn().mockReturnValue(Promise.resolve())
}));

const config = loadConfigFromEnv();
const blaiseApiMock: IMock<BlaiseApiClient> = Mock.ofType(BlaiseApiClient);
const authMock : IMock<Auth> = Mock.ofType(Auth);
const server = GetNodeServer(config, blaiseApiMock.object, authMock.object);
const sut = supertest(server);

/*
describe("Test Heath Endpoint", () => {
    
    it("should return a 200 status and json message", async () => {
        const response = await sut.get("/bam-ui/version/health");

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

        const response = await sut.get("/_ah/start");

        expect(response.statusCode).toEqual(200);
    });
});
*/


//import { Auth } from "blaise-login-react/blaise-login-react-server";
//import { BlaiseApi } from "blaise-api-node-client/src/interfaces/blaiseApi";
//const BlaiseApiClientMock: IMock<BlaiseApiClient> = Mock.ofType(BlaiseApiClient);

import { NewUser, UserRole, User } from "blaise-api-node-client";
//import { promiseImpl } from "ejs";
//import { createUser } from "blaise-api-node-client/lib/esm/functions/userFunctions";

// jest.mock('blaise-api-node-client', () => {
//     return jest.fn().mockImplementation(() => 
//         {
//             //createUser: jest.fn((user: NewUser) => Promise<NewUser>);
//         }
//     );
// });

import role_to_serverparks_map from '../role-to-serverparks-map.json'
describe("Test /api/users POST createUser with correct server parks", () => {
    beforeEach(() => {
        blaiseApiMock.reset();
    });

    afterAll(() => {
        blaiseApiMock.reset();
    });

    it("should return a 200 status and json message", async () => {
        const newUser : NewUser = {
            name:  "name1",
            password: "password1",
            role: "test-user-role",
            serverParks: ["sp1", "sp2"],
            defaultServerPark: "sp1"
        };
        blaiseApiMock.setup((api) => api.createUser(It.isAny())).returns(async () => newUser);

        const roleName = "IPS Field Interviewer"
        const spmap = role_to_serverparks_map[roleName]
        //jest.spyOn(blaiseApiClient, "createUser").mockImplementation(async () => promiseImpl<NewUser>());
        
        // const mock = jest.spyOn(blaiseApiClient, 'createUser');  // spy on foo
        
        // mock.mockImplementation(() => Promise.resolve(newUser))
        
        //BlaiseApiClient.createUser.mockReturnValue = null;
        //c.createUser.mo
        
        // const authManager = new AuthManager();
        // const authHeader = authManager.authHeader();
        // axios.post("/api/users", {
        //     headers: authHeader
        //   });
        
        const response = await sut.post("/api/users")
            .field("role", roleName);
            //.field("Authorization", "TEST123");

        expect(response.statusCode).toEqual(200);
        blaiseApiMock.verify(a => a.createUser(It.isAny()), Times.exactly(1));
        //let param1  = blaiseApiClientMock_interceptor._interceptorContext._actualInvocations[0].args[0];
        expect(response.body).toStrictEqual(newUser);
    });
});
