import { sendClientLog } from "./clientLog";
import { clientLogger } from "./logger";

vi.mock("./clientLog", () => ({
  sendClientLog: vi.fn().mockResolvedValue(undefined),
}));

const mockSendClientLog = vi.mocked(sendClientLog);

describe("clientLogger", () => {
  beforeEach(() => {
    mockSendClientLog.mockClear();
  });

  it("calls sendClientLog with 'debug' level", () => {
    clientLogger.debug("a debug message");

    expect(mockSendClientLog).toHaveBeenCalledWith("debug", "a debug message");
  });

  it("calls sendClientLog with 'info' level", () => {
    clientLogger.info("an info message");

    expect(mockSendClientLog).toHaveBeenCalledWith("info", "an info message");
  });

  it("calls sendClientLog with 'warn' level", () => {
    clientLogger.warn("a warning");

    expect(mockSendClientLog).toHaveBeenCalledWith("warn", "a warning");
  });

  it("calls sendClientLog with 'error' level", () => {
    clientLogger.error("an error");

    expect(mockSendClientLog).toHaveBeenCalledWith("error", "an error");
  });

  it("passes multiple args through to sendClientLog", () => {
    clientLogger.info("message", "extra1", "extra2");

    expect(mockSendClientLog).toHaveBeenCalledWith("info", "message", "extra1", "extra2");
  });
});
