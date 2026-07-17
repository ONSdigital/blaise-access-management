import { cleanup } from "@testing-library/react";

import { mockFetchImplementation, mockFetchJsonResponse } from "../../test-utils/fetch.mock";

import * as fetchJsonModule from "./fetchJson";
import { getAllRoles } from "./roles";

import type { UserRole } from "blaise-api-node-client";

const roleList: UserRole[] = [
  { name: "DST", permissions: ["Admin", "Bacon.access"], description: "A role" },
  { name: "BDSS", permissions: ["Admin"], description: "Another role" },
];

describe("Function getAllRoles() ", () => {
  it("It should return true with data if the list is returned successfully", async () => {
    mockFetchJsonResponse(200, roleList);
    const { success, data: roles } = await getAllRoles();

    expect(success).toBeTruthy();
    expect(roles).toEqual(roleList);
  });

  it("It should return false with an empty list if a 404 is returned from the server", async () => {
    mockFetchJsonResponse(404, []);
    const { success, data: roles } = await getAllRoles();

    expect(success).toBeFalsy();
    expect(roles).toEqual([]);
  });

  it("It should return false with an empty list if request returns an error code", async () => {
    mockFetchJsonResponse(500, {});
    const { success, data: roles } = await getAllRoles();

    expect(success).toBeFalsy();
    expect(roles).toEqual([]);
  });

  it("It should throw if request JSON is invalid and cannot be parsed", async () => {
    mockFetchImplementation(
      vi.fn(() =>
        Promise.resolve({
          status: 400,
          json: () => Promise.reject("Failed"),
        }),
      ),
    );

    await expect(getAllRoles()).rejects.toThrow("Failed");
  });

  it("It should return false with an empty list if request JSON is invalid", async () => {
    mockFetchJsonResponse(200, { name: "NAME" });
    const { success, data: roles } = await getAllRoles();

    expect(success).toBeFalsy();
    expect(roles).toEqual([]);
  });

  it("It should throw if the request call fails", async () => {
    mockFetchImplementation(
      vi.fn(() => {
        throw new Error("Network error");
      }),
    );

    await expect(getAllRoles()).rejects.toThrow("Network error");
  });

  afterAll(() => {
    vi.clearAllMocks();
    cleanup();
  });
});

describe("getAllRoles", () => {
  it("rethrows when fetchJsonList throws", async () => {
    const spy = vi
      .spyOn(fetchJsonModule, "fetchJsonList")
      .mockRejectedValueOnce(new Error("Unexpected"));

    await expect(getAllRoles()).rejects.toThrow("Unexpected");

    spy.mockRestore();
  });
});
