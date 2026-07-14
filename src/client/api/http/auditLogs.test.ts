import { cleanup } from "@testing-library/react";

import { mockFetchImplementation, mockFetchJsonResponse } from "../../test-utils/fetch.mock";
import { type AuditLog } from "../../utils/auditLog.types";

import { getAuditLogs } from "./auditLogs";
import * as fetchJsonModule from "./fetchJson";

const auditLogs: AuditLog[] = [
  {
    id: "1",
    timestamp: "2026-07-14T12:34:56.000Z",
    message: "rich created user bob",
    severity: "INFO",
  },
];

describe("Function getAuditLogs()", () => {
  it("returns true with data when the list is returned successfully", async () => {
    mockFetchJsonResponse(200, auditLogs);

    const [success, logs] = await getAuditLogs();

    expect(success).toBeTruthy();
    expect(logs).toEqual(auditLogs);
  });

  it("returns true with an empty list when a 404 is returned", async () => {
    mockFetchJsonResponse(404, []);

    const [success, logs] = await getAuditLogs();

    expect(success).toBeTruthy();
    expect(logs).toEqual([]);
  });

  it("returns false with an empty list if request returns an error code", async () => {
    mockFetchJsonResponse(500, {});

    const [success, logs] = await getAuditLogs();

    expect(success).toBeFalsy();
    expect(logs).toEqual([]);
  });

  it("returns false with an empty list if request JSON is invalid", async () => {
    mockFetchJsonResponse(200, { text: "invalid" });

    const [success, logs] = await getAuditLogs();

    expect(success).toBeFalsy();
    expect(logs).toEqual([]);
  });

  it("returns false with an empty list if request call fails", async () => {
    mockFetchImplementation(
      vi.fn(() => {
        throw new Error("Network error");
      }),
    );

    const [success, logs] = await getAuditLogs();

    expect(success).toBeFalsy();
    expect(logs).toEqual([]);
  });

  afterAll(() => {
    vi.clearAllMocks();
    cleanup();
  });
});

describe("getAuditLogs – catch branch (fetchJsonList throws)", () => {
  it("returns [false, []] when fetchJsonList throws", async () => {
    const spy = vi
      .spyOn(fetchJsonModule, "fetchJsonList")
      .mockRejectedValueOnce(new Error("Unexpected error"));

    const [success, logs] = await getAuditLogs();

    expect(success).toBeFalsy();
    expect(logs).toEqual([]);

    spy.mockRestore();
  });
});
