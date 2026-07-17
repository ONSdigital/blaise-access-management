import { mockFetchJsonResponse } from "../../test-utils/fetch.mock";

import { fetchJson, fetchJsonList } from "./fetchJson";

describe("fetchJson", () => {
  it("returns a response object for a 204 No Content response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          status: 204,
          json: () => Promise.reject(new Error("Should not call json() on 204")),
        }),
      ),
    );

    const response = await fetchJson("DELETE", "/api/resource");

    expect(response).toEqual({
      success: true,
      status: 204,
      data: {},
      message: "Request completed",
    });
  });

  it("returns a response object for a successful response with body", async () => {
    mockFetchJsonResponse(200, { name: "test" });

    const response = await fetchJson("GET", "/api/resource");

    expect(response).toEqual({
      success: true,
      status: 200,
      data: { name: "test" },
      message: "Request completed",
    });
  });

  it("throws when fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => {
        throw new Error("Network error");
      }),
    );

    await expect(fetchJson("GET", "/api/resource")).rejects.toThrow("Network error");
  });
});

describe("fetchJsonList", () => {
  it("returns a success object for a 200 response with array", async () => {
    mockFetchJsonResponse(200, [{ name: "item1" }, { name: "item2" }]);

    const response = await fetchJsonList<{ name: string }>("GET", "/api/list");

    expect(response.success).toBe(true);
    expect(response.data).toHaveLength(2);
  });

  it("returns a failure object for a 404 response", async () => {
    mockFetchJsonResponse(404, []);

    const response = await fetchJsonList("GET", "/api/list");

    expect(response).toEqual({
      success: false,
      status: 404,
      data: [],
      message: "Request failed",
      error: undefined,
    });
  });

  it("returns a failure object for a 500 response", async () => {
    mockFetchJsonResponse(500, {});

    const response = await fetchJsonList("GET", "/api/list");

    expect(response).toEqual({
      success: false,
      status: 500,
      data: [],
      message: "Request failed",
      error: undefined,
    });
  });

  it("throws when fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => {
        throw new Error("Network error");
      }),
    );

    await expect(fetchJsonList("GET", "/api/list")).rejects.toThrow("Network error");
  });
});
