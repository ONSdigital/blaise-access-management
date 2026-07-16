import { cleanup } from "@testing-library/react";

import { mockFetchImplementation, mockFetchJsonResponse } from "../../test-utils/fetch.mock";

import { fetchJson } from "./fetchJson";
import {
  addNewUser,
  deleteUser,
  editPassword,
  getAllUsers,
  getUser,
  patchUserRolesAndPermissions,
} from "./users";

import type { NewUser, User } from "blaise-api-node-client";

vi.mock("./fetchJson", async () => {
  const actualModule = await vi.importActual("./fetchJson");

  return {
    ...actualModule,
    fetchJson: vi.fn(),
  };
});
const fetchJsonMock = vi.mocked(fetchJson);

type TestApiResponse = {
  success: boolean;
  status: number;
  data: unknown;
  message: string;
  error?: unknown;
};

const userList: User[] = [
  { defaultServerPark: "gusty", name: "TestUser123", role: "DST", serverParks: ["gusty"] },
  { defaultServerPark: "gusty", name: "SecondUser", role: "BDSS", serverParks: ["gusty"] },
];

describe("Function getAllUsers(filename: string) ", () => {
  it("It should return true with data if the list is returned successfully", async () => {
    mockFetchJsonResponse(200, userList);
    const { success, data: users } = await getAllUsers();

    expect(success).toBeTruthy();
    expect(users).toEqual(userList);
  });

  it("It should return false with an empty list if a 404 is returned from the server", async () => {
    mockFetchJsonResponse(404, []);
    const { success, data: users } = await getAllUsers();

    expect(success).toBeFalsy();
    expect(users).toEqual([]);
  });

  it("It should return false with an empty list if request returns an error code", async () => {
    mockFetchJsonResponse(500, {});
    const { success, data: users } = await getAllUsers();

    expect(success).toBeFalsy();
    expect(users).toEqual([]);
  });

  it("It should return false with an empty list if request JSON is not a list", async () => {
    mockFetchImplementation(
      vi.fn(() =>
        Promise.resolve({
          status: 400,
          json: () => Promise.reject("Failed"),
        }),
      ),
    );

    const { success, data: users } = await getAllUsers();

    expect(success).toBeFalsy();
    expect(users).toEqual([]);
  });

  it("It should return false with an empty list if request JSON is invalid", async () => {
    mockFetchJsonResponse(200, { name: "NAME" });
    const { success, data: users } = await getAllUsers();

    expect(success).toBeFalsy();
    expect(users).toEqual([]);
  });

  it("It should return a failure object if the request call fails", async () => {
    mockFetchImplementation(
      vi.fn(() => {
        throw new Error("Network error");
      }),
    );

    const { success, data: users } = await getAllUsers();

    expect(success).toBeFalsy();
    expect(users).toEqual([]);
  });

  afterAll(() => {
    vi.clearAllMocks();
    cleanup();
  });
});

const newUser: NewUser = {
  name: "New User",
  password: "password",
  role: "DST",
  defaultServerPark: "gusty",
  serverParks: ["gusty"],
};

describe("Function addNewUser(user: User) ", () => {
  let promiseResponse: TestApiResponse;

  it("It should return true if the user has been created successfully", async () => {
    promiseResponse = { success: true, status: 201, data: {}, message: "Created" };
    fetchJsonMock.mockResolvedValue(promiseResponse);

    const response = await addNewUser(newUser);

    expect(response.success).toBeTruthy();
  });

  it("It should return false if a password is not provided", async () => {
    promiseResponse = { success: true, status: 201, data: {}, message: "Created" };
    fetchJsonMock.mockResolvedValue(promiseResponse);

    const newUser: NewUser = {
      defaultServerPark: "",
      name: "username",
      password: "",
      role: "",
      serverParks: [],
    };

    const response = await addNewUser(newUser);

    expect(response.success).toBeFalsy();
    expect(response.status).toBe(400);
  });

  it("It should return false if a 404 is returned from the server", async () => {
    promiseResponse = { success: false, status: 404, data: [], message: "Not found" };
    fetchJsonMock.mockResolvedValue(promiseResponse);
    const response = await addNewUser(newUser);

    expect(response.success).toBeFalsy();
  });

  it("It should return false if request returns an error code", async () => {
    promiseResponse = { success: false, status: 500, data: {}, message: "Server error" };
    fetchJsonMock.mockResolvedValue(promiseResponse);
    const response = await addNewUser(newUser);

    expect(response.success).toBeFalsy();
  });

  it("It should return an error response if request call fails", async () => {
    fetchJsonMock.mockRejectedValue(new Error("Async error"));

    const response = await addNewUser(newUser);

    expect(response.success).toBeFalsy();
    expect(response.status).toBe(500);
  });

  afterAll(() => {
    vi.clearAllMocks();
    cleanup();
  });
});

describe("Function deleteUser(username: string) ", () => {
  const userToDelete = "dave01";
  let promiseResponse: TestApiResponse;

  it("It should return true if the user has been deleted successfully", async () => {
    promiseResponse = { success: true, status: 204, data: {}, message: "Deleted" };
    fetchJsonMock.mockResolvedValue(promiseResponse);
    const response = await deleteUser(userToDelete);

    expect(response.success).toBeTruthy();
  });

  it("It should return false if a 404 is returned from the server", async () => {
    promiseResponse = { success: false, status: 404, data: [], message: "Not found" };
    fetchJsonMock.mockResolvedValue(promiseResponse);
    const response = await deleteUser(userToDelete);

    expect(response.success).toBeFalsy();
  });

  it("It should return false if request returns an error code", async () => {
    promiseResponse = { success: false, status: 500, data: {}, message: "Server error" };
    fetchJsonMock.mockResolvedValue(promiseResponse);
    const response = await deleteUser(userToDelete);

    expect(response.success).toBeFalsy();
  });

  it("It should return an error response if request call fails", async () => {
    fetchJsonMock.mockRejectedValue(new Error("Network error"));

    const response = await deleteUser(userToDelete);

    expect(response.success).toBeFalsy();
    expect(response.status).toBe(500);
  });

  afterAll(() => {
    vi.clearAllMocks();
    cleanup();
  });
});

describe("Function editPassword(username: string, newPassword: string) ", () => {
  const username = "testUser";
  const newPassword = "password123";

  let promiseResponse: TestApiResponse;

  it("It should return true if the password has been updated successfully", async () => {
    promiseResponse = { success: true, status: 204, data: {}, message: "Updated" };
    fetchJsonMock.mockResolvedValue(promiseResponse);
    const response = await editPassword(username, newPassword);

    expect(response.success).toBeTruthy();
  });

  it("It should return false if a password is not provided", async () => {
    const invalidPassword = "";

    const response = await editPassword(username, invalidPassword);

    expect(response.success).toBeFalsy();
    expect(response.status).toBe(400);
  });

  it("It should return false if a 404 is returned from the server", async () => {
    promiseResponse = { success: false, status: 404, data: {}, message: "Not found" };
    fetchJsonMock.mockResolvedValue(promiseResponse);
    const response = await editPassword(username, newPassword);

    expect(response.success).toBeFalsy();
  });

  it("It should return false if request returns an error code", async () => {
    promiseResponse = { success: false, status: 500, data: {}, message: "Server error" };
    fetchJsonMock.mockResolvedValue(promiseResponse);

    const response = await editPassword(username, newPassword);

    expect(response.success).toBeFalsy();
  });

  it("It should return an error response if request call fails", async () => {
    fetchJsonMock.mockRejectedValue(new Error("Async error"));

    const response = await editPassword(username, newPassword);

    expect(response.success).toBeFalsy();
    expect(response.status).toBe(500);
  });

  afterAll(() => {
    vi.clearAllMocks();
    cleanup();
  });
});

describe("Function getUser(user: string)", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns status, message and data on success", async () => {
    fetchJsonMock.mockResolvedValueOnce({
      success: true,
      status: 200,
      message: "Request completed",
      data: {
        message: "User found",
        data: {
          name: "testUser",
          role: "DST",
          serverParks: ["gusty"],
          defaultServerPark: "gusty",
        },
      },
    });

    const result = await getUser("testUser");

    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
    expect(result.message).toBe("User found");
    expect((result.data as { name: string }).name).toBe("testUser");
  });

  it("returns an error object when request fails", async () => {
    fetchJsonMock.mockRejectedValueOnce(new Error("Not found"));

    const result = await getUser("noUser");

    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
  });

  it("falls back to top-level message and empty user when response data is not an object", async () => {
    fetchJsonMock.mockResolvedValueOnce({
      success: true,
      status: 200,
      message: "Request completed",
      data: "invalid payload",
    });

    const result = await getUser("testUser");

    expect(result.success).toBe(true);
    expect(result.message).toBe("Request completed");
    expect(result.data).toEqual({});
  });

  it("falls back to empty user when nested data object is missing", async () => {
    fetchJsonMock.mockResolvedValueOnce({
      success: true,
      status: 200,
      message: "Request completed",
      data: {
        message: "User payload missing",
      },
    });

    const result = await getUser("testUser");

    expect(result.success).toBe(true);
    expect(result.message).toBe("User payload missing");
    expect(result.data).toEqual({});
  });

  it("falls back to empty user when nested data is not a valid user", async () => {
    fetchJsonMock.mockResolvedValueOnce({
      success: true,
      status: 200,
      message: "Request completed",
      data: {
        message: "Invalid user",
        data: {
          name: "testUser",
          role: "DST",
          serverParks: ["gusty"],
        },
      },
    });

    const result = await getUser("testUser");

    expect(result.success).toBe(true);
    expect(result.message).toBe("Invalid user");
    expect(result.data).toEqual({});
  });
});

describe("Function getAllUsers", () => {
  it("returns failure when fetchJsonList throws", async () => {
    const fetchJsonModule = await import("./fetchJson");
    const spy = vi
      .spyOn(fetchJsonModule, "fetchJsonList")
      .mockRejectedValueOnce(new Error("Unexpected"));

    const result = await getAllUsers();

    expect(result.success).toBe(false);
    expect(result.data).toEqual([]);

    spy.mockRestore();
  });
});

describe("Function patchUserRolesAndPermissions(user: string, role: string, previousRole: string)", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns status and message on success", async () => {
    fetchJsonMock.mockResolvedValueOnce({
      success: true,
      status: 200,
      message: "Request completed",
      data: { message: "Role updated" },
    });

    const result = await patchUserRolesAndPermissions("testUser", "DST", "BDSS");

    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
    expect(result.message).toBe("Role updated");
    expect(fetchJsonMock).toHaveBeenCalledWith(
      "PATCH",
      "/api/users/testUser/rolesAndPermissions",
      JSON.stringify({ role: "DST", previousRole: "BDSS" }),
      { "Content-Type": "application/json" },
    );
  });

  it("returns error object when request fails", async () => {
    fetchJsonMock.mockRejectedValueOnce(new Error("Server error"));

    const result = await patchUserRolesAndPermissions("testUser", "BAD_ROLE", "BDSS");

    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
  });
});
