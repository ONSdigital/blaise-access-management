import { cleanup } from "@testing-library/react";

import { mockFetchImplementation, mockFetchJsonResponse } from "../../test-utils/fetch.mock";

import * as fetchJsonModule from "./fetchJson";
import { addNewRole, getAllRoles } from "./roles";

import type { UserRole } from "blaise-api-node-client";

const roleList: UserRole[] = [
  { name: "DST", permissions: ["Admin", "Bacon.access"], description: "A role" },
  { name: "BDSS", permissions: ["Admin"], description: "Another role" },
];

describe("Function getAllRoles() ", () => {
  it("It should return true with data if the list is returned successfully", async () => {
    mockFetchJsonResponse(200, roleList);
    const [success, roles] = await getAllRoles();

    expect(success).toBeTruthy();
    expect(roles).toEqual(roleList);
  });

  it("It should return true with an empty list if a 404 is returned from the server", async () => {
    mockFetchJsonResponse(404, []);
    const [success, roles] = await getAllRoles();

    expect(success).toBeTruthy();
    expect(roles).toEqual([]);
  });

  it("It should return false with an empty list if request returns an error code", async () => {
    mockFetchJsonResponse(500, {});
    const [success, roles] = await getAllRoles();

    expect(success).toBeFalsy();
    expect(roles).toEqual([]);
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

    const [success, roles] = await getAllRoles();

    expect(success).toBeFalsy();
    expect(roles).toEqual([]);
  });

  it("It should return false with an empty list if request JSON is invalid", async () => {
    mockFetchJsonResponse(200, { name: "NAME" });
    const [success, roles] = await getAllRoles();

    expect(success).toBeFalsy();
    expect(roles).toEqual([]);
  });

  it("It should return false with an empty list if request call fails", async () => {
    mockFetchImplementation(
      vi.fn(() => {
        throw new Error("Network error");
      }),
    );

    const [success, roles] = await getAllRoles();

    expect(success).toBeFalsy();
    expect(roles).toEqual([]);
  });

  afterAll(() => {
    vi.clearAllMocks();
    cleanup();
  });
});

describe("Function addNewRole(user: User) ", () => {
  const newRole: UserRole = {
    permissions: [],
    name: "New Role",
    description: "This is a new role",
  };

  it("It should return true if the role has been created successfully", async () => {
    mockFetchJsonResponse(201, {});
    const success = await addNewRole(newRole);

    expect(success).toBeTruthy();
  });

  it("It should return false if a 404 is returned from the server", async () => {
    mockFetchJsonResponse(404, []);
    const success = await addNewRole(newRole);

    expect(success).toBeFalsy();
  });

  it("It should return false if request returns an error code", async () => {
    mockFetchJsonResponse(500, {});
    const success = await addNewRole(newRole);

    expect(success).toBeFalsy();
  });

  it("It should return false if request call fails", async () => {
    mockFetchImplementation(
      vi.fn(() => {
        throw new Error("Network error");
      }),
    );

    const success = await addNewRole(newRole);

    expect(success).toBeFalsy();
  });

  afterAll(() => {
    vi.clearAllMocks();
    cleanup();
  });
});

describe("getAllRoles – catch branch (fetchJsonList throws)", () => {
  it("returns [false, []] when fetchJsonList throws", async () => {
    const spy = vi
      .spyOn(fetchJsonModule, "fetchJsonList")
      .mockRejectedValueOnce(new Error("Unexpected"));

    const [success, roles] = await getAllRoles();

    expect(success).toBeFalsy();
    expect(roles).toEqual([]);

    spy.mockRestore();
  });
});

describe("addNewRole – catch branch (fetchJson rejects)", () => {
  it("returns false when fetchJson rejects", async () => {
    const spy = vi
      .spyOn(fetchJsonModule, "fetchJson")
      .mockRejectedValueOnce(new Error("Network error"));

    const role = { name: "TestRole", description: "Test", permissions: [] };
    const result = await addNewRole(role);

    expect(result).toBe(false);

    spy.mockRestore();
  });
});
