import { BlaiseApiClient } from "blaise-api-node-client";
import { Auth } from "blaise-login-react-server";
import pino from "pino";
import supertest from "supertest";
import { It, Mock, Times } from "typemoq";

import { loadServerConfigFromEnv } from "../config/appConfig.js";
import roleToServerParksMapJson from "../config/role-to-server-parks-map.json" with { type: "json" };
import createNodeServer from "../server.js";
import AuditLogger from "../utils/auditLogger.js";
import createLogger from "../utils/httpLogger.js";

import type { NewUser, User, UserRole } from "blaise-api-node-client";
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
const roleToServerParksMap = roleToServerParksMapJson as Record<string, string[]> & {
  DEFAULT: string[];
};
const mockUser: User = {
  name: "testUser",
  role: "DST",
  defaultServerPark: "park1",
  serverParks: ["park1", "park2"],
};
const mockAuthToken = auth.signToken(mockUser);

const logger: pino.Logger = pino();
const logInfo = vi.spyOn(logger, "info");
const logError = vi.spyOn(logger, "error");
const httpLogger: HttpLogger = createLogger({ logger: logger, autoLogging: false });

const blaiseApiMock: IMock<BlaiseApiClient> = Mock.ofType(
  BlaiseApiClient,
  undefined,
  undefined,
  "http://blaise-api",
);

const server = createNodeServer(config, blaiseApiMock.object, auth, httpLogger);
const sut = supertest(server);

describe("POST /api/users endpoint", () => {
  beforeEach(() => {
    blaiseApiMock.reset();
    vi.clearAllMocks();
  });

  it("should call Blaise API createUser endpoint with correct serverParks for each role EXISTING in server/role-to-server-parks-map.json AND return http status OK_200", async () => {
    const roleName = "Field Interviewer";

    logInfo.mockReset();
    blaiseApiMock.reset();

    const spmap = roleToServerParksMap[roleName];
    const newUser: NewUser = {
      name: "name1",
      password: "password1",
      role: roleName,
      serverParks: spmap,
      defaultServerPark: spmap[0],
    };

    blaiseApiMock.setup((api) => api.createUser(It.isAny())).returns(async () => newUser);

    const response = await sut
      .post("/api/users")
      .set("Authorization", `Bearer ${mockAuthToken}`)
      .field("name", newUser.name)
      .field("role", roleName);

    expect(logInfo.mock.calls[0][0]).toEqual(
      `AUDIT_LOG: ${mockUser.name} created user ${newUser.name} with role ${roleName}`,
    );
    expect(response.statusCode).toEqual(200);
    blaiseApiMock.verify(
      (a) =>
        a.createUser(
          It.is<NewUser>(
            (x) =>
              x.defaultServerPark == newUser.defaultServerPark &&
              x.role == newUser.role &&
              Array.isArray(x.serverParks) &&
              x.serverParks.every((item) => typeof item === "string") &&
              x.serverParks.every((val, idx) => val === newUser.serverParks[idx]),
          ),
        ),
      Times.exactly(1),
    );
    expect(response.body).toStrictEqual(newUser);
  });

  it("should call Blaise API createUser endpoint with DEFAULT serverParks for a role MISSING in server/role-to-server-parks-map.json AND return http status OK_200)", async () => {
    const roleName = "this role is missing in server/role-to-server-parks-map.json file";
    const spmap = roleToServerParksMap.DEFAULT;
    const newUser: NewUser = {
      name: "name1",
      password: "password1",
      role: roleName,
      serverParks: spmap,
      defaultServerPark: spmap[0],
    };

    blaiseApiMock.setup((api) => api.createUser(It.isAny())).returns(async () => newUser);

    const response = await sut
      .post("/api/users")
      .field("name", newUser.name)
      .field("role", roleName)
      .set("Authorization", `Bearer ${mockAuthToken}`);

    const log = logInfo.mock.calls[0][0];

    expect(log).toEqual(
      `AUDIT_LOG: ${mockUser.name} created user ${newUser.name} with role ${roleName}`,
    );
    expect(response.statusCode).toEqual(200);
    blaiseApiMock.verify(
      (a) =>
        a.createUser(
          It.is<NewUser>(
            (x) =>
              x.defaultServerPark == newUser.defaultServerPark &&
              x.role == newUser.role &&
              Array.isArray(x.serverParks) &&
              x.serverParks.every((item) => typeof item === "string") &&
              x.serverParks.every((val, idx) => val === newUser.serverParks[idx]),
          ),
        ),
      Times.exactly(1),
    );
    expect(response.body).toStrictEqual(newUser);
  });

  it("should ignore client provided serverParks/defaultServerPark and enforce values from server role map", async () => {
    const roleName = "Field Interviewer";
    const mappedServerParks = roleToServerParksMap[roleName];
    const newUser: NewUser = {
      name: "name1",
      password: "password1",
      role: roleName,
      serverParks: mappedServerParks,
      defaultServerPark: mappedServerParks[0],
    };

    blaiseApiMock.setup((api) => api.createUser(It.isAny())).returns(async () => newUser);

    const response = await sut
      .post("/api/users")
      .set("Authorization", `Bearer ${mockAuthToken}`)
      .field("name", newUser.name)
      .field("password", newUser.password)
      .field("role", roleName)
      .field("serverParks", "malicious-park")
      .field("defaultServerPark", "malicious-default");

    expect(response.statusCode).toEqual(200);
    blaiseApiMock.verify(
      (a) =>
        a.createUser(
          It.is<NewUser>(
            (x) =>
              x.role === roleName &&
              x.defaultServerPark === mappedServerParks[0] &&
              Array.isArray(x.serverParks) &&
              x.serverParks.every((val, idx) => val === mappedServerParks[idx]),
          ),
        ),
      Times.exactly(1),
    );
    expect(response.body).toStrictEqual(newUser);
  });

  it("should return http status BAD_REQUEST_400 if role is empty OR hasn't been specified in the request", async () => {
    let response = await sut
      .post("/api/users")
      .field("role", "")
      .set("Authorization", `Bearer ${mockAuthToken}`);

    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual("No role provided for user creation");

    response = await sut
      .post("/api/users")
      .set("Authorization", `Bearer ${mockAuthToken}`)
      .send({});
    expect(response.statusCode).toEqual(400);
    expect(response.body.message).toEqual("No role provided for user creation");
  });

  it("should return http status INTERNAL_SERVER_ERROR_500 if Blaise API client throws an error", async () => {
    const roleName = "Field Interviewer";
    const spmap = roleToServerParksMap[roleName];
    const newUser: NewUser = {
      name: "name1",
      password: "password1",
      role: roleName,
      serverParks: spmap,
      defaultServerPark: spmap[0],
    };
    const errorMessage = "Blaise API client error";

    blaiseApiMock.setup((api) => api.createUser(It.isAny())).throws(new Error(errorMessage));

    const response = await sut
      .post("/api/users")
      .set("Authorization", `Bearer ${mockAuthToken}`)
      .field("name", newUser.name)
      .field("role", roleName);

    const successMessage = `AUDIT_LOG: ${mockUser.name} created user ${newUser.name} with role ${roleName}`;

    expect(response.statusCode).toEqual(500);
    expect(response.body).toStrictEqual({ error: "Internal server error" });
    expect(logInfo.mock.calls.some(([message]) => message === successMessage)).toBe(false);
    blaiseApiMock.verify(
      (a) =>
        a.createUser(
          It.is<NewUser>(
            (x) =>
              x.defaultServerPark == newUser.defaultServerPark &&
              x.role == newUser.role &&
              Array.isArray(x.serverParks) &&
              x.serverParks.every((item) => typeof item === "string") &&
              x.serverParks.every((val, idx) => val === newUser.serverParks[idx]),
          ),
        ),
      Times.exactly(1),
    );
  });
});

describe("DELETE /api/users endpoint", () => {
  beforeEach(() => {
    blaiseApiMock.reset();
    vi.clearAllMocks();
  });

  afterAll(() => {
    blaiseApiMock.reset();
  });

  it("should call Blaise API deleteUser endpoint for VALID user header field AND return http status NO_CONTENT_204", async () => {
    blaiseApiMock.setup((api) => api.deleteUser(It.isAny())).returns((_) => Promise.resolve(null));
    const username = "user-123";
    const response = await sut
      .delete("/api/users")
      .set("Authorization", `Bearer ${mockAuthToken}`)
      .set("user", username);

    const log = logInfo.mock.calls[0][0];

    expect(log).toEqual(`AUDIT_LOG: ${mockUser.name} has successfully deleted user ${username}`);
    expect(response.statusCode).toEqual(204);
    blaiseApiMock.verify((a) => a.deleteUser(It.isValue<string>(username)), Times.once());
  });

  it("should return error message if external Blaise API deleteUser endpoint rejects request with error message AND should return http status INTERNAL_SERVER_ERROR_500", async () => {
    const username = "user-123";
    const errorMessage = "Error occurred when calling deleteUser on Blaise API Rest Service";

    blaiseApiMock
      .setup((a) => a.deleteUser(It.isAnyString()))
      .returns((_) => Promise.reject(errorMessage));

    const response = await sut
      .delete("/api/users")
      .set("Authorization", `Bearer ${mockAuthToken}`)
      .set("user", username);

    const log = logError.mock.calls[0][0];
    const successMessage = `AUDIT_LOG: ${mockUser.name} has successfully deleted user ${username}`;

    expect(log).toEqual(
      `AUDIT_LOG: Error whilst trying to delete user, ${username}, with error message: ${errorMessage}`,
    );
    expect(response.statusCode).toEqual(500);
    expect(logInfo.mock.calls.some(([message]) => message === successMessage)).toBe(false);
    blaiseApiMock.verify((a) => a.deleteUser(It.isValue<string>(username)), Times.once());
    expect(response.body).toStrictEqual({ error: "Internal server error" });
  });

  it("should call Blaise API deleteUser endpoint for INVALID or MISSING user header field AND return http status BAD_REQUEST_400", async () => {
    let response = await sut
      .delete("/api/users")
      .set("Authorization", `Bearer ${mockAuthToken}`)
      .set("user", "");

    const log = logError.mock.calls[0][0];

    expect(log).toEqual("AUDIT_LOG: No user provided for deletion");
    expect(response.statusCode).toEqual(400);

    response = await sut.delete("/api/users").set("Authorization", `Bearer ${mockAuthToken}`);
    expect(response.statusCode).toEqual(400);
  });
});

describe("GET /api/users endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call Blaise API getUsers endpoint AND return http status OK_200", async () => {
    const newUser1: NewUser = {
      name: "name1",
      password: "password1",
      role: "role1",
      serverParks: ["sp1", "sp2"],
      defaultServerPark: "sp1",
    };
    const newUser2: NewUser = { ...newUser1, name: "name2" };
    const newUser3: NewUser = { ...newUser1, name: "name3" };
    const userArray: NewUser[] = [newUser1, newUser2, newUser3];

    blaiseApiMock.setup((api) => api.getUsers()).returns((_) => Promise.resolve(userArray));

    const response = await sut.get("/api/users").set("Authorization", `Bearer ${mockAuthToken}`);

    expect(response.statusCode).toEqual(200);
    blaiseApiMock.verify((a) => a.getUsers(), Times.once());
  });
});

describe("GET /api/roles endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call Blaise API getUserRoles endpoint AND return http status OK_200", async () => {
    const userRole1: UserRole = {
      name: "name1",
      description: "desc1",
      permissions: ["perm1", "perm2"],
    };
    const userRole2: UserRole = { ...userRole1, name: "name2" };
    const userRole3: UserRole = { ...userRole1, name: "name3" };
    const userRoleArray: UserRole[] = [userRole1, userRole2, userRole3];

    blaiseApiMock.setup((api) => api.getUserRoles()).returns((_) => Promise.resolve(userRoleArray));

    const response = await sut.get("/api/roles").set("Authorization", `Bearer ${mockAuthToken}`);

    expect(response.statusCode).toEqual(200);
    blaiseApiMock.verify((a) => a.getUserRoles(), Times.once());
  });
});

describe("GET /api/audit endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns audit logs with HTTP 200", async () => {
    const mockAuditLogs = [
      {
        id: "audit-1",
        timestamp: "2026-07-14T12:34:56.000Z",
        message: "rich created user bob",
        severity: "INFO",
      },
    ];

    vi.spyOn(AuditLogger.prototype, "getLogs").mockResolvedValueOnce(mockAuditLogs);

    const response = await sut.get("/api/audit").set("Authorization", `Bearer ${mockAuthToken}`);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toStrictEqual(mockAuditLogs);
  });

  it("returns HTTP 500 when audit logs retrieval fails", async () => {
    vi.spyOn(AuditLogger.prototype, "getLogs").mockRejectedValueOnce(new Error("boom"));

    const response = await sut.get("/api/audit").set("Authorization", `Bearer ${mockAuthToken}`);

    expect(response.statusCode).toEqual(500);
    expect(response.body).toStrictEqual({ error: "Failed to retrieve audit logs" });
  });
});

describe("POST /api/change-password/:user endpoint", () => {
  beforeEach(() => {
    blaiseApiMock.reset();
    vi.clearAllMocks();
  });
  afterAll(() => {
    blaiseApiMock.reset();
  });
  it("should call Blaise API changePassword endpoint for VALID request AND return http status NO_CONTENT_204", async () => {
    const username = "user1";
    const password = "password-1234";

    blaiseApiMock
      .setup((api) => api.changePassword(It.isAnyString(), It.isAnyString()))
      .returns((_) => Promise.resolve(null));

    const response = await sut
      .post(`/api/change-password/${username}`)
      .set("Authorization", `Bearer ${mockAuthToken}`)
      .field("password", password);

    const log = logInfo.mock.calls[0][0];

    expect(log).toEqual(`AUDIT_LOG: ${mockUser.name} changed password for user ${username}`);
    expect(response.statusCode).toEqual(204);
    blaiseApiMock.verify(
      (a) => a.changePassword(It.isValue<string>(username), It.isValue<string>(password)),
      Times.once(),
    );
  });

  it("should NOT call Blaise API changePassword endpoint for INVALID request AND return http status BAD_REQUEST_400", async () => {
    const username = "user1";
    const password = "";

    const response = await sut
      .post(`/api/change-password/${username}`)
      .set("Authorization", `Bearer ${mockAuthToken}`)
      .field("password", password);

    expect(response.statusCode).toEqual(400);
    blaiseApiMock.verify(
      (a) => a.changePassword(It.isAnyString(), It.isAnyString()),
      Times.never(),
    );
  });

  it("should return error message if external Blaise API changePassword endpoint rejects request with error message AND should return http status INTERNAL_SERVER_ERROR_500", async () => {
    const username = "user1";
    const password = "password-1234";
    const errorMessage = "Error occurred when calling changePassword on Blaise API Rest Service";

    blaiseApiMock
      .setup((api) => api.changePassword(It.isAnyString(), It.isAnyString()))
      .returns((_) => Promise.reject(errorMessage));

    const response = await sut
      .post(`/api/change-password/${username}`)
      .set("Authorization", `Bearer ${mockAuthToken}`)
      .field("password", password);

    const log = logError.mock.calls[0][0];

    expect(log).toEqual(
      `AUDIT_LOG: Error whilst trying to change password for ${username}: ${errorMessage}`,
    );
    expect(response.statusCode).toEqual(500);
    blaiseApiMock.verify((a) => a.changePassword(It.isAnyString(), It.isAnyString()), Times.once());
    expect(response.body).toStrictEqual(errorMessage);
  });

  it("should call Blaise API changePassword endpoint for VALID request even if password is array of characters AND return http status NO_CONTENT_204 ", async () => {
    const username = "user1";
    const password = ["p", "a", "s", "s", "w", "o", "r", "d"];

    blaiseApiMock
      .setup((api) => api.changePassword(It.isAnyString(), It.isAnyString()))
      .returns((_) => Promise.resolve(null));

    const response = await sut
      .post(`/api/change-password/${username}`)
      .set("Authorization", `Bearer ${mockAuthToken}`)
      .field("password", password);

    const log = logInfo.mock.calls[0][0];

    expect(log).toEqual(`AUDIT_LOG: ${mockUser.name} changed password for user ${username}`);
    expect(response.statusCode).toEqual(204);
    blaiseApiMock.verify(
      (a) => a.changePassword(It.isValue<string>(username), It.isValue<string>("password")),
      Times.once(),
    );
  });

  it("should join the password if an array is passed", async () => {
    const data: { password: string | string[] } = {
      password: ["p", "a", "s", "s", "w", "o", "r", "d"],
    };

    if (Array.isArray(data.password)) {
      data.password = data.password.join("");
    }

    expect(data.password).toBe("password");
  });
});

describe("PATCH /api/users/:user/rolesAndPermissions endpoint", () => {
  beforeEach(() => {
    blaiseApiMock.reset();
    vi.clearAllMocks();
  });

  afterAll(() => {
    blaiseApiMock.reset();
  });

  it("should update user role and permissions successfully and return http status 200", async () => {
    const user = "testUser";
    const role = "Field Interviewer";
    const previousRole = "DST";
    const serverParks = ["gusty", "cma"];
    const defaultServerPark = "gusty";

    blaiseApiMock
      .setup((api) => api.changeUserRole(It.isValue(user), It.isValue(role)))
      .returns(async () => null);
    blaiseApiMock
      .setup((api) =>
        api.changeUserServerParks(
          It.isValue(user),
          It.isValue(serverParks),
          It.isValue(defaultServerPark),
        ),
      )
      .returns(async () => null);

    const response = await sut
      .patch(`/api/users/${user}/rolesAndPermissions`)
      .set("Authorization", `Bearer ${mockAuthToken}`)
      .send({ role, previousRole });

    const log = logInfo.mock.calls[0][0];

    expect(log).toEqual(
      `AUDIT_LOG: testUser changed user ${user} role to ${role} (previously ${previousRole})`,
    );
    expect(response.statusCode).toEqual(200);
    expect(response.body.message).toContain(
      `Successfully updated role to ${role} for user ${user}`,
    );
    blaiseApiMock.verify(
      (api) => api.changeUserRole(It.isValue(user), It.isValue(role)),
      Times.once(),
    );
    blaiseApiMock.verify(
      (api) =>
        api.changeUserServerParks(
          It.isValue(user),
          It.isValue(serverParks),
          It.isValue(defaultServerPark),
        ),
      Times.once(),
    );
  });

  it("should return http status BAD_REQUEST_400 if role or user is not provided", async () => {
    const user = "testUser";
    const role = "";

    const response = await sut
      .patch(`/api/users/${user}/rolesAndPermissions`)
      .set("Authorization", `Bearer ${mockAuthToken}`)
      .send({ role });

    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual("No user or role provided");
  });

  it("should return http status INTERNAL_SERVER_ERROR_500 if Blaise API client throws an error", async () => {
    const user = "testUser";
    const role = "admin";
    const errorMessage = "Blaise API client error";

    blaiseApiMock
      .setup((api) => api.changeUserRole(It.isAny(), It.isAny()))
      .returns(async () => {
        throw new Error(errorMessage);
      });

    const response = await sut
      .patch(`/api/users/${user}/rolesAndPermissions`)
      .set("Authorization", `Bearer ${mockAuthToken}`)
      .send({ role });

    const infoLog = logInfo.mock.calls[0][0];
    const errorLog = logError.mock.calls[0][0];

    expect(infoLog).toEqual(
      `AUDIT_LOG: ${mockUser.name} has failed to update user role and permissions to ${role} for ${user}`,
    );
    expect(errorLog).toEqual(
      `AUDIT_LOG: Error whilst trying to update user role and permissions to admin for ${mockUser.name}, with error message: Error: ${errorMessage}`,
    );
    expect(response.statusCode).toEqual(500);
    expect(response.body.message).toContain(
      "Failed to update user role and permissions to admin for testUser",
    );
  });
});

describe("GET /api/users/:user endpoint", () => {
  beforeEach(() => {
    blaiseApiMock.reset();
    vi.clearAllMocks();
  });
  afterAll(() => {
    blaiseApiMock.reset();
  });

  it("should call Blaise API getUser endpoint if user param is valid and return user if exists in blaise", async () => {
    const user: NewUser = {
      name: "test",
      password: "password1",
      role: "DST",
      serverParks: ["gusty", "cma"],
      defaultServerPark: "gusty",
    };

    blaiseApiMock.setup((api) => api.getUser(It.isAnyString())).returns(async () => user);
    const response = await sut
      .get("/api/users/test")
      .set("Authorization", `Bearer ${mockAuthToken}`);

    blaiseApiMock.verify((api) => api.getUser(It.isValue("test")), Times.once());
    expect(response.statusCode).toEqual(200);
    expect(response.body.data).toEqual(user);
  });

  it("should call Blaise API getUser endpoint if user param is valid and return error if user does not exists in blaise", async () => {
    const errorMessage = "Blaise API client error";

    blaiseApiMock
      .setup((api) => api.getUser(It.isAnyString()))
      .returns((_) => Promise.reject(errorMessage));
    const response = await sut
      .get("/api/users/invalidUser")
      .set("Authorization", `Bearer ${mockAuthToken}`);

    expect(response.statusCode).toEqual(500);
    expect(response.body.message).toContain("Error whilst trying to retrieve user");
    expect(response.body.error).toEqual(errorMessage);
  });
});
