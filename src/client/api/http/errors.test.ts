import axios, { AxiosError, AxiosHeaders } from "axios";

import { handleAxiosError } from "./errors";

describe("handleAxiosError", () => {
  it("returns status and message from an AxiosError with a response", () => {
    const error = new AxiosError("Request failed", "ERR_BAD_RESPONSE", undefined, undefined, {
      status: 404,
      data: { message: "Not found" },
      statusText: "Not Found",
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() },
    });

    const result = handleAxiosError(error);

    expect(result.status).toBe(404);
    expect(result.message).toBe("Not found");
    expect(result.error).toBe(error);
  });

  it("returns 500 when AxiosError has no response", () => {
    const error = new AxiosError("Network Error");

    const result = handleAxiosError(error);

    expect(result.status).toBe(500);
    expect(result.message).toBe("Axios error occurred with no specific message");
    expect(result.error).toBe(error);
  });

  it("returns 500 with generic message for a non-Axios error", () => {
    const error = new Error("Something went wrong");

    const result = handleAxiosError(error);

    expect(result.status).toBe(500);
    expect(result.message).toContain("An unknown error occurred");
    expect(result.message).toContain("Something went wrong");
    expect(result.error).toBe(error);
  });

  it("returns 500 with generic message for a string error", () => {
    const error = "plain string error";

    const result = handleAxiosError(error);

    expect(result.status).toBe(500);
    expect(result.message).toContain("An unknown error occurred");
    expect(result.error).toBe(error);
  });

  it("returns status from AxiosError response when response.data.message is absent", () => {
    const error = new AxiosError("Request failed", "ERR_BAD_RESPONSE", undefined, undefined, {
      status: 403,
      data: {},
      statusText: "Forbidden",
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() },
    });

    const result = handleAxiosError(error);

    expect(result.status).toBe(403);
    expect(result.message).toBe("Axios error occurred with no specific message");
  });

  it("isAxiosError correctly identifies axios errors", () => {
    const axiosError = new AxiosError("test");

    expect(axios.isAxiosError(axiosError)).toBe(true);
    expect(axios.isAxiosError(new Error("plain"))).toBe(false);
  });
});
