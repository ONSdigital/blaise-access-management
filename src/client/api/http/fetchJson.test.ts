import { mockFetchJsonResponse } from "../../test-utils/fetch.mock";

import { fetchJson, fetchJsonList } from "./fetchJson";

describe("fetchJson", () => {
  it("returns [status, {}] for a 204 No Content response (no JSON body)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          status: 204,
          // 204 should NOT call .json()
          json: () => Promise.reject(new Error("Should not call json() on 204")),
        }),
      ),
    );

    const [status, data] = await fetchJson("DELETE", "/api/resource");

    expect(status).toBe(204);
    expect(data).toEqual({});
  });

  it("returns [status, json] for a successful response with body", async () => {
    mockFetchJsonResponse(200, { name: "test" });

    const [status, data] = await fetchJson("GET", "/api/resource");

    expect(status).toBe(200);
    expect(data).toEqual({ name: "test" });
  });

  it("returns [0, {}] when fetch throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => {
        throw new Error("Network error");
      }),
    );

    const [status, data] = await fetchJson("GET", "/api/resource");

    expect(status).toBe(0);
    expect(data).toEqual({});
  });
});

describe("fetchJsonList", () => {
  it("returns [true, data] for a 200 response with array", async () => {
    mockFetchJsonResponse(200, [{ name: "item1" }, { name: "item2" }]);

    const [success, data] = await fetchJsonList<{ name: string }>("GET", "/api/list");

    expect(success).toBe(true);
    expect(data).toHaveLength(2);
  });

  it("returns [true, data] for a 404 response", async () => {
    mockFetchJsonResponse(404, []);

    const [success, data] = await fetchJsonList("GET", "/api/list");

    expect(success).toBe(true);
    expect(data).toEqual([]);
  });

  it("returns [false, []] for a 500 response", async () => {
    mockFetchJsonResponse(500, {});

    const [success, data] = await fetchJsonList("GET", "/api/list");

    expect(success).toBe(false);
    expect(data).toEqual([]);
  });
});
