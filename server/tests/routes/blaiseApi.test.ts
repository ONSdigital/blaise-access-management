/**
 * @jest-environment node
 */

import supertest from "supertest";
import GetNodeServer from "../../server";
import BlaiseApiClient, { NewUser, User, UserRole } from "blaise-api-node-client";
import { Auth } from "blaise-login-react/blaise-login-react-server";
import { IMock, Mock, It, Times } from "typemoq";
import role_to_serverparks_map from "../../role-to-serverparks-map.json";
import { size } from "lodash";
import createLogger from "../../logger/pinoLogger";
import pino from "pino";
import { HttpLogger } from "pino-http";
import { loadConfigFromEnv } from "../../Config";
// eslint-disable-next-line import/no-extraneous-dependencies
import jwt from "jsonwebtoken";

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
const mockUser: User = { name: "testUser", role: "DST", defaultServerPark: "park1", serverParks: ["park1", "park2"] };
const mockAuthToken = jwt.sign({ "user": mockUser }, mockSecret);

const logger: pino.Logger = pino();
logger.child = jest.fn(() => logger);
const logInfo = jest.spyOn(logger, "info");
const logError = jest.spyOn(logger, "error");
const httpLogger: HttpLogger = createLogger({ logger: logger });

const blaiseApiMock: IMock<BlaiseApiClient> = Mock.ofType(BlaiseApiClient);

const server = GetNodeServer(config, blaiseApiMock.object, auth, httpLogger);
const sut = supertest(server);

// Blaise API endpoints
describe("POST /api/users endpoint", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should call Blaise API createUser endpoint with correct serverParks for each role EXISTING in server/role-to-serverparks-map.json AND return http status OK_200", async () => {
        let currentRoleNo = 0;
        const totalRoleCount = size(role_to_serverparks_map);
        for (const roleName in role_to_serverparks_map)
        {
            logInfo.mockReset();
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
                .set("Authorization", `${mockAuthToken}`)
                .field("name", newUser.name)
                .field("role", roleName);

            expect(logInfo.mock.calls[0][0]).toEqual(`AUDIT_LOG: ${mockUser.name} has successfully created user, ${newUser.name}, with an assigned role of ${roleName}`);
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
            .field("name", newUser.name)
            .field("role", roleName)
            .set("Authorization", `${mockAuthToken}`);

        const log = logInfo.mock.calls[0][0];
        expect(log).toEqual(`AUDIT_LOG: ${mockUser.name} has successfully created user, ${newUser.name}, with an assigned role of ${roleName}`);
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
            .field("role", "")
            .set("Authorization", `${mockAuthToken}`);

        expect(response.statusCode).toEqual(400);
        expect(response.body.message).toEqual("No role provided for user creation");

        response = await sut.post("/api/users")
            .set("Authorization", `${mockAuthToken}`);
        expect(response.statusCode).toEqual(400);
        expect(response.body.message).toEqual("No role provided for user creation");
    });

    it("should return http status INTERNAL_SERVER_ERROR_500 if Blaise API client throws an error", async () => {
        const roleName = "IPS Manager";
        const spmap = role_to_serverparks_map.DEFAULT;
        const newUser : NewUser = {
            name:  "name1",
            password: "password1",
            role: roleName,
            serverParks: spmap,
            defaultServerPark: spmap[0]
        };
        const errorMessage = "Blaise API client error";
        blaiseApiMock.setup((api) => api.createUser(It.isAny())).throws(new Error(errorMessage));

        const response = await sut.post("/api/users")
            .set("Authorization", `${mockAuthToken}`)
            .field("name", newUser.name)
            .field("role", roleName);

        const log = logError.mock.calls[0][0];
        expect(log).toEqual(`AUDIT_LOG: Error whilst trying to create new user, ${newUser.name}, with error message: Error: ${errorMessage}`);
        expect(response.statusCode).toEqual(500);
    });
});

describe("DELETE /api/users endpoint", () => {
    beforeEach(() => {
        blaiseApiMock.reset();
        jest.clearAllMocks();
    });

    afterAll(() => {
        blaiseApiMock.reset();
    });

    it("should call Blaise API deleteUser endpoint for VALID user header field AND return http status NO_CONTENT_204", async () => {
        blaiseApiMock.setup((api) => api.deleteUser(It.isAny())).returns(_ => Promise.resolve(null));
        const username = "user-123";
        const response = await sut.delete("/api/users")
            .set("Authorization", `${mockAuthToken}`)
            .set("user", username);

        const log = logInfo.mock.calls[0][0];
        expect(log).toEqual(`AUDIT_LOG: ${mockUser.name} has successfully deleted user called ${username}`);
        expect(response.statusCode).toEqual(204);
        blaiseApiMock.verify(a => a.deleteUser(It.isValue<string>(username)), Times.once());
    });

    it("should return error message if external Blaise API deleteUser endpoint rejects request with error message AND should return http status INTERNAL_SERVER_ERROR_500", async () => {
        const username = "user-123";
        const errorMessage = "Error occured when calling deleteUser on Blaise API Rest Service";
        blaiseApiMock.setup((a) => a.deleteUser(It.isAnyString()))
            .returns(_ => Promise.reject(errorMessage));

        const response = await sut.delete("/api/users")
            .set("Authorization", `${mockAuthToken}`)
            .set("user", username);

        const log = logError.mock.calls[0][0];
        expect(log).toEqual(`AUDIT_LOG: Error whilst trying to delete user, ${username}, with error message: ${errorMessage}`);
        expect(response.statusCode).toEqual(500);
        blaiseApiMock.verify(a => a.deleteUser(It.isValue<string>(username)), Times.once());
        expect(response.body).toStrictEqual(errorMessage);
    });

    it("should call Blaise API deleteUser endpoint for INVALID or MISSING user header field AND return http status BAD_REQUEST_400", async () => {
        let response = await sut.delete("/api/users")
            .set("Authorization", `${mockAuthToken}`)
            .set("user", "");

        const log = logError.mock.calls[0][0];
        expect(log).toEqual("AUDIT_LOG: No user provided for deletion");
        expect(response.statusCode).toEqual(400);

        response = await sut.delete("/api/users")
            .set("Authorization", `${mockAuthToken}`);
        expect(response.statusCode).toEqual(400);
    });
});

describe("GET /api/users endpoint", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

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

        const response = await sut.get("/api/users")
            .set("Authorization", `${mockAuthToken}`);

        expect(response.statusCode).toEqual(200);
        blaiseApiMock.verify(a => a.getUsers(), Times.once());
    });
});

describe("GET /api/roles endpoint", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

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

        const response = await sut.get("/api/roles")
            .set("Authorization", `${mockAuthToken}`);

        expect(response.statusCode).toEqual(200);
        blaiseApiMock.verify(a => a.getUserRoles(), Times.once());
    });
});

// TODO: Changing a resource should be a PATCH request not a GET request
describe("GET /api/change-password/:user endpoint", () => {
    beforeEach(() => {
        blaiseApiMock.reset();
        jest.clearAllMocks();
    });

    afterAll(() => {
        blaiseApiMock.reset();
    });

    it("should call Blaise API changePassword endpoint for VALID request AND return http status NO_CONTENT_204", async () => {
        const username = "user1";
        const password = "password-1234";
        blaiseApiMock.setup((api) => api.changePassword(It.isAnyString(), It.isAnyString())).returns(_ => Promise.resolve(null));

        const response = await sut.get("/api/change-password/"+username)
            .set("Authorization", `${mockAuthToken}`)
            .set("password", password);

        const log = logInfo.mock.calls[0][0];
        expect(log).toEqual(`AUDIT_LOG: ${mockUser.name} has successfully changed the password for ${username}`);
        expect(response.statusCode).toEqual(204);
        blaiseApiMock.verify(a => a.changePassword(It.isValue<string>(username), It.isValue<string>(password)), Times.once());
    });

    it("should NOT call Blaise API changePassword endpoint for INVALID request AND return http status BAD_REQUEST_400", async () => {
        const username = "user1";
        const password = "";

        const response = await sut.get("/api/change-password/"+ username)
            .set("Authorization", `${mockAuthToken}`)
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

        const response = await sut.get("/api/change-password/"+ username)
            .set("Authorization", `${mockAuthToken}`)
            .set("password", password);

        const log = logError.mock.calls[0][0];
        expect(log).toEqual(`AUDIT_LOG: Error whilst trying to change password for ${username}: ${errorMessage}`);
        expect(response.statusCode).toEqual(500);
        blaiseApiMock.verify(a => a.changePassword(It.isAnyString(), It.isAnyString()), Times.once());
        expect(response.body).toStrictEqual(errorMessage);
    });
});

describe("PATCH /api/users/:user/rolesAndPermissions endpoint", () => {
    beforeEach(() => {
        blaiseApiMock.reset();
        jest.clearAllMocks();
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
            .set("Authorization", `${mockAuthToken}`)
            .send({ role });

        const log = logInfo.mock.calls[0][0];
        expect(log).toEqual("AUDIT_LOG: testUser has successfully updated user role and permissions to IPS Manager for testUser");
        expect(response.statusCode).toEqual(200);
        expect(response.body.message).toContain(`Successfully updated user role and permissions to ${role} for ${user}`);
        blaiseApiMock.verify(api => api.changeUserRole(It.isValue(user), It.isValue(role)), Times.once());
        blaiseApiMock.verify(api => api.changeUserServerParks(It.isValue(user), It.isValue(serverParks), It.isValue(defaultServerPark)), Times.once());
    });

    it("should return http status BAD_REQUEST_400 if role or user is not provided", async () => {
        const user = "testUser";
        const role = "";

        const response = await sut.patch(`/api/users/${user}/rolesAndPermissions`)
            .set("Authorization", `${mockAuthToken}`)
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
            .set("Authorization", `${mockAuthToken}`)
            .send({ role });

        const infoLog = logInfo.mock.calls[0][0];
        const errorLog = logError.mock.calls[0][0];
        expect(infoLog).toEqual(`AUDIT_LOG: ${mockUser.name} has failed to update user role and permissions to ${role} for ${user}`);
        expect(errorLog).toEqual(`AUDIT_LOG: Error whilst trying to update user role and permissions to admin for ${mockUser.name}, with error message: Error: ${errorMessage}`);
        expect(response.statusCode).toEqual(500);
        expect(response.body.message).toContain("Failed to update user role and permissions to admin for testUser");
    });
});