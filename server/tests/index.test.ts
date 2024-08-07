/**
 * @jest-environment node
 */

import supertest from "supertest";
import GetNodeServer from "../server";
import { loadConfigFromEnv } from "../Config";
import BlaiseApiClient, { NewUser, User, UserRole } from "blaise-api-node-client";
import { Auth } from "blaise-login-react/blaise-login-react-server";
import { IMock, Mock, It, Times } from "typemoq";

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

import role_to_serverparks_map from "../role-to-serverparks-map.json";
import { size } from "lodash";
import { Exception } from "typemoq/Error/Exception";
import { Errback } from "express";
describe("Test /api/users POST endpoint", () => {
    it("should call Blaise API createUser endpoint with correct serverParks for each role EXISTING in server/role-to-serverparks-map.json AND return http status OK_200", async () => {
        let currentRoleNo = 0;
        const totalRoleCount = size(role_to_serverparks_map);
        for(const roleName in role_to_serverparks_map)
        {
            blaiseApiMock.reset();
            console.log("Running for role %i of %i:  %s", ++currentRoleNo, totalRoleCount, roleName);

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

    it("should call Blaise API createUser endpoint with DEFAULT serverParks for a role MISSING in server/role-to-serverparks-map.json AND return http status OK_200)", async () => {
        const roleName = "this role is missing in server/role-to-serverparks-map.json file";
        const spmap = role_to_serverparks_map.DEFAULT;
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
    });

    it("should return http status BAD_REQUEST_400 if role is empty OR hasn't been specified in the request", async () => {
        let response = await sut.post("/api/users")
            .field("role", "");
        expect(response.statusCode).toEqual(400);

        response = await sut.post("/api/users");
        expect(response.statusCode).toEqual(400);
    });
});

describe("Test /api/users DELETE endpoint", () => {
    beforeEach(() => {
        blaiseApiMock.reset();
    });

    afterAll(() => {
        blaiseApiMock.reset();
    });

    it("should call Blaise API deleteUser endpoint for VALID user header field AND return http status NO_CONTENT_204", async () => {
        blaiseApiMock.setup((api) => api.deleteUser(It.isAny())).returns(_ => Promise.resolve(null));
        const username = "user-123";
        const response = await sut.delete("/api/users")
            .set("user", username);

        expect(response.statusCode).toEqual(204);
        blaiseApiMock.verify(a => a.deleteUser(It.isValue<string>(username)), Times.once());
    });

    it("should call Blaise API deleteUser endpoint for INVALID or MISSING user header field AND return http status BAD_REQUEST_400", async () => {
        let response = await sut.delete("/api/users")
            .set("user", "");
        expect(response.statusCode).toEqual(400);

        response = await sut.delete("/api/users");
        expect(response.statusCode).toEqual(400);
    });
});

describe("Test /api/users GET endpoint", () => {
    it("should call Blaise API getUsers endpoint AND return http status OK_200", async () => {
        const newUser1 : NewUser = {
            name:  "name1",
            password: "password1",
            role: "role1",
            serverParks: ["sp1", "sp2"],
            defaultServerPark: "sp1"
        };
        const newUser2 = newUser1;
        newUser2.name = "name2";
        const newUser3 = newUser2;
        newUser3.name = "name3";
        const userArray : NewUser [] = [newUser1, newUser2, newUser3];
        blaiseApiMock.setup((api) => api.getUsers()).returns(_ => Promise.resolve(userArray));

        const response = await sut.get("/api/users");

        expect(response.statusCode).toEqual(200);
        blaiseApiMock.verify(a => a.getUsers(), Times.once());
    });
});

describe("Test /api/roles GET endpoint", () => {
    it("should call Blaise API getUserRoles endpoint AND return http status OK_200", async () => {
        const userRole1 : UserRole = {
            name:  "name1",
            description: "desc1",
            permissions: ["perm1", "perm2"]
        };
        const userRole2 = userRole1;
        userRole2.name = "name2";
        const userRole3 = userRole2;
        userRole3.name = "name3";
        const userRoleArray : UserRole [] = [userRole1, userRole2, userRole3];
        blaiseApiMock.setup((api) => api.getUserRoles()).returns(_ => Promise.resolve(userRoleArray));

        const response = await sut.get("/api/roles");

        expect(response.statusCode).toEqual(200);
        blaiseApiMock.verify(a => a.getUserRoles(), Times.once());
    });
});

describe("Test /api/change-password/:user GET endpoint", () => {
    beforeEach(() => {
        blaiseApiMock.reset();
    });

    afterAll(() => {
        blaiseApiMock.reset();
    });

    it("should call Blaise API changePassword endpoint for VALID request AND return http status NO_CONTENT_204", async () => {
        const username = "user1";
        const password = "password-1234";
        blaiseApiMock.setup((api) => api.changePassword(It.isAnyString(), It.isAnyString())).returns(_ => Promise.resolve(null));

        const response = await sut.get("/api/change-password/"+username)
            .set("password", password);

        expect(response.statusCode).toEqual(204);
        blaiseApiMock.verify(a => a.changePassword(It.isValue<string>(username), It.isValue<string>(password)), Times.once());
    });

    it("should NOT call Blaise API changePassword endpoint for INVALID request AND return http status BAD_REQUEST_400", async () => {
        const username = "user1";
        const password = "";

        const response = await sut.get("/api/change-password/"+username)
            .set("password", password);

        expect(response.statusCode).toEqual(400);
        blaiseApiMock.verify(a => a.changePassword(It.isAnyString(), It.isAnyString()), Times.never());
    });

    it("should return error message if external Blaise API changePassword endpoint rejects request with error message AND should return http status INTERNAL_SERVER_ERROR_500", async () => {
        const username = "user1";
        const password = "password-1234";
        const errorMessage = "Error occured when calling changePassword on Blaise API Rest Service";
        blaiseApiMock.setup((a) => a.changePassword(It.isAnyString(), It.isAnyString()))
            .returns(_ => Promise.reject(errorMessage));

        const response = await sut.get("/api/change-password/"+username)
            .set("password", password);

        expect(response.statusCode).toEqual(500);
        blaiseApiMock.verify(a => a.changePassword(It.isAnyString(), It.isAnyString()), Times.once());
        expect(response.body).toStrictEqual(errorMessage);
    });
});

describe("PATCH /api/users/:user/rolesAndPermissions endpoint", () => {
    beforeEach(() => {
        blaiseApiMock.reset();
    });

    afterAll(() => {
        blaiseApiMock.reset();
    });

    it("should update user role and permissions successfully and return http status 200", async () => {
        const user = "testUser";
        const role = "IPS Manager";
        const serverParks = ["gusty", "cma"];
        const defaultServerPark = "gusty";
        blaiseApiMock.setup(api => api.changeUserRole(It.isValue(user), It.isValue(role)))
            .returns(async () => null);
        blaiseApiMock.setup(api => api.changeUserServerParks(It.isValue(user), It.isValue(serverParks), It.isValue(defaultServerPark)))
            .returns(async () => null);

        const response = await sut.patch(`/api/users/${user}/rolesAndPermissions`)
            .send({ role });

        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toContain(`Successfully updated user role and permissions to ${role} for ${user}`);
        blaiseApiMock.verify(api => api.changeUserRole(It.isValue(user), It.isValue(role)), Times.once());
        blaiseApiMock.verify(api => api.changeUserServerParks(It.isValue(user), It.isValue(serverParks), It.isValue(defaultServerPark)), Times.once());
    });

    it("should return http status BAD_REQUEST_400 if role or user is not provided", async () => {
        const user = "testUser";
        const role = "";

        const response = await sut.patch(`/api/users/${user}/rolesAndPermissions`)
            .send({ role });

        expect(response.statusCode).toEqual(400);
        expect(response.body).toEqual("No user or role provided");
    });

    it("should return http status INTERNAL_SERVER_ERROR_500 if Blaise API client throws an error", async () => {
        const user = "testUser";
        const role = "admin";
        const errorMessage = "Blaise API client error";
        blaiseApiMock.setup(api => api.changeUserRole(It.isAny(), It.isAny()))
            .returns(async () => { throw new Error(errorMessage); });

        const response = await sut.patch(`/api/users/${user}/rolesAndPermissions`)
            .send({ role });

        expect(response.statusCode).toEqual(500);
        expect(response.body.message).toContain(errorMessage);
    });
});
