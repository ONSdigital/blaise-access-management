/**
 * @jest-environment node
 */

import supertest from "supertest";
import GetNodeServer from "../server";
import { loadConfigFromEnv } from "../Config";
import BlaiseApiClient, {NewUser, User} from "blaise-api-node-client";
import { Auth } from "blaise-login-react/blaise-login-react-server";
import { IMock, Mock, It, Times  } from "typemoq";

// Temporary fix for Jest open handle issue (gcp profiler TCPWRAP error)
jest.mock("@google-cloud/profiler", () => ({
    start: jest.fn().mockReturnValue(Promise.resolve())
}));

const config = loadConfigFromEnv();
const blaiseApiMock: IMock<BlaiseApiClient> = Mock.ofType(BlaiseApiClient);
Auth.prototype.ValidateToken = jest.fn().mockReturnValue(true);
const auth = new Auth(config);
const server = GetNodeServer(config, blaiseApiMock.object, auth);
const sut = supertest(server);


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

import role_to_serverparks_map from '../role-to-serverparks-map.json'
import { size } from "lodash";
describe("Test /api/users POST createUser with correct server parks", () => {
    beforeEach(() => {
        blaiseApiMock.reset();
    });

    afterAll(() => {
        blaiseApiMock.reset();
    });

    it("should call Blaise API createUser endpoint with correct serverParks for each role in server/role-to-serverparks-map.json and return http status 200", async () => {
        let index = 0;
        let roleCount = size(role_to_serverparks_map);
        for(let roleName in role_to_serverparks_map)   
        {
            blaiseApiMock.reset();
            console.log("Running for role %i of %i:  %s", ++index, roleCount, roleName);
            
            const spmap = role_to_serverparks_map[roleName];
            const newUser : NewUser = {
                name:  "name1",
                password: "password1",
                role: roleName,
                serverParks: spmap,
                defaultServerPark: spmap[0]
            };
            blaiseApiMock.setup((api) => api.createUser(It.isAny())).returns(async () => newUser);
            
            const response = await sut.post("/api/users")
                .field("role", roleName);

            expect(response.statusCode).toEqual(200);
            blaiseApiMock.verify(a => a.createUser(It.is<NewUser>(
                x=> x.defaultServerPark == newUser.defaultServerPark 
                    && x.role == newUser.role
                    && Array.isArray(x.serverParks) && x.serverParks.every(item => typeof item === "string")
                    && x.serverParks.every((val, idx) => val === newUser.serverParks[idx])
            )), Times.exactly(1));
            expect(response.body).toStrictEqual(newUser);
        }
    });
});
