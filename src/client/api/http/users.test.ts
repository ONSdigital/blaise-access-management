import { cleanup } from "@testing-library/react";
import axios, { AxiosHeaders } from "axios";

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

vi.mock("axios");

vi.mock("./fetchJson", async () => {
  const actualModule = await vi.importActual("./fetchJson");

  return {
    ...actualModule,
    fetchJson: vi.fn(),
  };
});
const fetchJsonMock = vi.mocked(fetchJson);

const userList: User[] = [
  { defaultServerPark: "gusty", name: "TestUser123", role: "DST", serverParks: ["gusty"] },
  { defaultServerPark: "gusty", name: "SecondUser", role: "BDSS", serverParks: ["gusty"] },
];

describe("Function getAllUsers(filename: string) ", () => {
  it("It should return true with data if the list is returned successfully", async () => {
    mockFetchJsonResponse(200, userList);
    const [success, users] = await getAllUsers();

    expect(success).toBeTruthy();
    expect(users).toEqual(userList);
  });

  it("It should return true with an empty list if a 404 is returned from the server", async () => {
    mockFetchJsonResponse(404, []);
    const [success, users] = await getAllUsers();

    expect(success).toBeTruthy();
    expect(users).toEqual([]);
  });

  it("It should return false with an empty list if request returns an error code", async () => {
    mockFetchJsonResponse(500, {});
    const [success, users] = await getAllUsers();

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

    const [success, users] = await getAllUsers();

    expect(success).toBeFalsy();
    expect(users).toEqual([]);
  });

  it("It should return false with an empty list if request JSON is invalid", async () => {
    mockFetchJsonResponse(200, { name: "NAME" });
    const [success, users] = await getAllUsers();

    expect(success).toBeFalsy();
    expect(users).toEqual([]);
  });

  it("It should return false with an empty list if request call fails", async () => {
    mockFetchImplementation(
      vi.fn(() => {
        throw new Error("Network error");
      }),
    );
    const [success, users] = await getAllUsers();

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
  let promiseResponse: [number, JSON];

  it("It should return true if the user has been created successfully", async () => {
    promiseResponse = [201, JSON.parse("{}")];
    fetchJsonMock.mockResolvedValue(promiseResponse);

    const success = await addNewUser(newUser);

    expect(success).toBeTruthy();
  });

  it("It should return false if a password is not provided", async () => {
    promiseResponse = [201, JSON.parse("{}")];
    fetchJsonMock.mockResolvedValue(promiseResponse);

    const newUser: NewUser = {
      defaultServerPark: "",
      name: "username",
      password: "",
      role: "",
      serverParks: [],
    };

    const success = await addNewUser(newUser);

    expect(success).toBeFalsy();
  });

  it("It should return false if a 404 is returned from the server", async () => {
    promiseResponse = [404, JSON.parse("[]")];
    fetchJsonMock.mockResolvedValue(promiseResponse);
    const success = await addNewUser(newUser);

    expect(success).toBeFalsy();
  });

  it("It should return false if request returns an error code", async () => {
    promiseResponse = [500, JSON.parse("{}")];
    fetchJsonMock.mockResolvedValue(promiseResponse);
    const success = await addNewUser(newUser);

    expect(success).toBeFalsy();
  });

  it("It should return false if request call fails", async () => {
    fetchJsonMock.mockRejectedValue(new Error("Async error"));
    const success = await addNewUser(newUser);

    expect(success).toBeFalsy();
  });

  afterAll(() => {
    vi.clearAllMocks();
    cleanup();
  });
});

describe("Function deleteUser(username: string) ", () => {
  const userToDelete = "dave01";
  let promiseResponse: [number, JSON];

  it("It should return true if the user has been deleted successfully", async () => {
    promiseResponse = [204, JSON.parse("{}")];
    fetchJsonMock.mockResolvedValue(promiseResponse);
    const success = await deleteUser(userToDelete);

    expect(success).toBeTruthy();
  });

  it("It should return false if a 404 is returned from the server", async () => {
    promiseResponse = [404, JSON.parse("[]")];
    fetchJsonMock.mockResolvedValue(promiseResponse);
    const success = await deleteUser(userToDelete);

    expect(success).toBeFalsy();
  });

  it("It should return false if request returns an error code", async () => {
    promiseResponse = [500, JSON.parse("{}")];
    fetchJsonMock.mockResolvedValue(promiseResponse);
    const success = await deleteUser(userToDelete);

    expect(success).toBeFalsy();
  });

  it("It should return false if request call fails", async () => {
    fetchJsonMock.mockRejectedValue(new Error("Network error"));
    const success = await deleteUser(userToDelete);

    expect(success).toBeFalsy();
  });

  afterAll(() => {
    vi.clearAllMocks();
    cleanup();
  });
});

describe("Function editPassword(username: string, newPassword: string) ", () => {
  const username = "testUser";
  const newPassword = "password123";

  let promiseResponse: [number, JSON];

  it("It should return true if the password has been updated successfully", async () => {
    promiseResponse = [204, JSON.parse("{}")];
    fetchJsonMock.mockResolvedValue(promiseResponse);
    const response = await editPassword(username, newPassword);

    expect(response).toBeTruthy();
  });

  it("It should return false if a password is not provided", async () => {
    const invalidPassword = "";

    const response = await editPassword(username, invalidPassword);

    expect(response).toBeFalsy();
  });

  it("It should return false if a 404 is returned from the server", async () => {
    promiseResponse = [404, JSON.parse("{}")];
    fetchJsonMock.mockResolvedValue(promiseResponse);
    const response = await editPassword(username, newPassword);

    expect(response).toBeFalsy();
  });

  it("It should return false if request returns an error code", async () => {
    promiseResponse = [500, JSON.parse("{}")];
    fetchJsonMock.mockResolvedValue(promiseResponse);

    const response = await editPassword(username, newPassword);

    expect(response).toBeFalsy();
  });

  it("It should return false if request call fails", async () => {
    fetchJsonMock.mockRejectedValue(new Error("Async error"));

    const response = await editPassword(username, newPassword);

    expect(response).toBeFalsy();
  });

  afterAll(() => {
    vi.clearAllMocks();
    cleanup();
  });
});

describe("Function getUser(user: string)", () => {
  const axiosGetMock = vi.mocked(axios.get);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns status, message and data on success", async () => {
    axiosGetMock.mockResolvedValueOnce({
      status: 200,
      data: { message: "User found", data: { name: "testUser", role: "DST" } },
    });

    const result = await getUser("testUser");

    expect(result.status).toBe(200);
    expect(result.message).toBe("User found");
    expect((result.data as { name: string }).name).toBe("testUser");
  });

  it("throws an error when the request fails", async () => {
    const axiosError = new AxiosHeaders();

    axiosGetMock.mockRejectedValueOnce(
      Object.assign(new Error("Not found"), {
        response: {
          status: 404,
          data: { message: "Not found" },
          headers: axiosError,
          config: { headers: axiosError },
        },
      }),
    );

    await expect(getUser("noUser")).rejects.toThrow();
  });
});

describe("Function getAllUsers – catch branch (fetchJsonList throws)", () => {
  it("returns [false, []] when fetchJsonList throws", async () => {
    const fetchJsonModule = await import("./fetchJson");
    const spy = vi
      .spyOn(fetchJsonModule, "fetchJsonList")
      .mockRejectedValueOnce(new Error("Unexpected"));

    const [success, users] = await getAllUsers();

    expect(success).toBeFalsy();
    expect(users).toEqual([]);

    spy.mockRestore();
  });
});

describe("Function patchUserRolesAndPermissions(user: string, role: string)", () => {
  const axiosPatchMock = vi.mocked(axios.patch);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns status and message on success", async () => {
    axiosPatchMock.mockResolvedValueOnce({
      status: 200,
      data: { message: "Role updated" },
    });

    const result = await patchUserRolesAndPermissions("testUser", "DST");

    expect(result.status).toBe(200);
    expect(result.message).toBe("Role updated");
  });

  it("returns error object when request fails", async () => {
    const axiosError = new AxiosHeaders();

    axiosPatchMock.mockRejectedValueOnce(
      Object.assign(new Error("Server error"), {
        response: {
          status: 500,
          data: { message: "Server error" },
          headers: axiosError,
          config: { headers: axiosError },
        },
      }),
    );

    const result = await patchUserRolesAndPermissions("testUser", "BAD_ROLE");

    expect(result.status).toBe(500);
  });
});
