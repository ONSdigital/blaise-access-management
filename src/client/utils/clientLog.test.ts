import axios from "axios";

import { sendClientLog } from "./clientLog";

vi.mock("axios");

const axiosPostMock = vi.mocked(axios.post);

describe("sendClientLog", () => {
  beforeEach(() => {
    axiosPostMock.mockResolvedValue({});
  });

  it("posts a log payload for a normal message", async () => {
    await sendClientLog("info", "Hello world");

    expect(axiosPostMock).toHaveBeenCalledWith(
      "/api/client-log",
      expect.objectContaining({ level: "info", message: "Hello world" }),
      expect.anything(),
    );
  });

  it("returns early without posting when message is empty string", async () => {
    await sendClientLog("info", "");

    expect(axiosPostMock).not.toHaveBeenCalled();
  });

  it("returns early without posting when message is whitespace only", async () => {
    await sendClientLog("warn", "   ");

    expect(axiosPostMock).not.toHaveBeenCalled();
  });

  it("returns early without posting when no args are provided", async () => {
    await sendClientLog("error");

    expect(axiosPostMock).not.toHaveBeenCalled();
  });

  it("includes additional args in the payload", async () => {
    await sendClientLog("debug", "main message", "extra1", "extra2");

    expect(axiosPostMock).toHaveBeenCalledWith(
      "/api/client-log",
      expect.objectContaining({ args: ["extra1", "extra2"] }),
      expect.anything(),
    );
  });

  it("includes Error stack when an Error is passed as an arg", async () => {
    const err = new Error("boom");

    await sendClientLog("error", "something broke", err);

    expect(axiosPostMock).toHaveBeenCalledWith(
      "/api/client-log",
      expect.objectContaining({ stack: err.stack }),
      expect.anything(),
    );
  });

  it("serialises an Error object as the message", async () => {
    const err = new Error("msg-error");

    await sendClientLog("error", err);

    const payload = axiosPostMock.mock.calls[0]?.[1] as { message: string };

    expect(payload.message).toContain("msg-error");
  });

  it("serialises a non-string, non-Error object as the message via JSON", async () => {
    await sendClientLog("info", { key: "value" });

    const payload = axiosPostMock.mock.calls[0]?.[1] as { message: string };

    expect(payload.message).toBe('{"key":"value"}');
  });

  it("ignores axios post failures silently", async () => {
    axiosPostMock.mockRejectedValueOnce(new Error("network down"));

    await expect(sendClientLog("warn", "something")).resolves.toBeUndefined();
  });

  it("includes window location and userAgent in the payload", async () => {
    await sendClientLog("info", "location test");

    expect(axiosPostMock).toHaveBeenCalledWith(
      "/api/client-log",
      expect.objectContaining({
        pathname: expect.any(String),
        href: expect.any(String),
      }),
      expect.anything(),
    );
  });

  it("falls back to String(value) when JSON.stringify throws (circular reference)", async () => {
    const circular: { self?: unknown } = {};

    circular.self = circular;

    await sendClientLog("info", circular);

    expect(axiosPostMock).toHaveBeenCalled();
  });
});
