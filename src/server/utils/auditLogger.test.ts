import { formatLogMessage } from "./auditLogger.js";
import AuditLogger from "./auditLogger.js";

// Mock @google-cloud/logging for all getLogs tests.
// The dynamic import inside getLoggerClient will get this mock.
vi.mock("@google-cloud/logging", () => {
  const mockGetEntries = vi.fn().mockResolvedValue([[]]);
  const mockLog = vi.fn().mockReturnValue({ getEntries: mockGetEntries });

  return {
    // Must use 'function' (not arrow) so the mock is usable as a constructor
    Logging: vi.fn().mockImplementation(function () {
      return { log: mockLog };
    }),
  };
});

describe("formatLogMessage utility function ensures complex log messages are sanitized but still readable", () => {
  it("should preserve newlines and carriage returns", () => {
    const inputMessage = "Error: Something went wrong\nDetails: Invalid input\r\nPlease try again.";
    const expectedOutput =
      "AUDIT_LOG: Error: Something went wrong\nDetails: Invalid input\r\nPlease try again.";

    const formattedMessage = formatLogMessage(inputMessage, "error");

    console.log("Expected log format:", JSON.stringify(expectedOutput));
    console.log("Received log format:", JSON.stringify(formattedMessage));

    expect(formattedMessage).toBe(expectedOutput);
  });

  it("should remove non-printable characters", () => {
    const message =
      "Error: Something went wrong\x01\x02\n    at FunctionName (file.js:10:15)\x03\x04\n    at AnotherFunction (file.js:20:25)\r\n    at YetAnotherFunction (file.js:30:35)";
    const expectedOutput =
      "AUDIT_LOG: Error: Something went wrong\n    at FunctionName (file.js:10:15)\n    at AnotherFunction (file.js:20:25)\r\n    at YetAnotherFunction (file.js:30:35)";
    const formattedMessage = formatLogMessage(message, "error");

    console.log("Expected log format:", JSON.stringify(expectedOutput));
    console.log("Received log format:", JSON.stringify(formattedMessage));

    expect(formattedMessage).toBe(expectedOutput);
  });
});

describe("AuditLogger class", () => {
  it("constructor sets projectId, logName and logger to null", () => {
    const al = new AuditLogger("my-project");

    expect(al.projectId).toBe("my-project");
    expect(al.logger).toBeNull();
    expect(al.logName).toBe("projects/my-project/logs/stdout");
  });

  describe("info()", () => {
    it("calls logger.info with a formatted AUDIT_LOG message", () => {
      const al = new AuditLogger("test-project");
      const mockLog = { info: vi.fn(), error: vi.fn() };

      al.info(
        mockLog as unknown as typeof mockLog & Parameters<typeof al.info>[0],
        "User logged in",
      );

      expect(mockLog.info).toHaveBeenCalledWith("AUDIT_LOG: User logged in");
    });
  });

  describe("error()", () => {
    it("calls logger.error with a formatted AUDIT_LOG message", () => {
      const al = new AuditLogger("test-project");
      const mockLog = { info: vi.fn(), error: vi.fn() };

      al.error(mockLog as unknown as Parameters<typeof al.error>[0], "Something broke");

      expect(mockLog.error).toHaveBeenCalledWith("AUDIT_LOG: Something broke");
    });

    it("truncates error messages longer than 1000 characters", () => {
      const al = new AuditLogger("test-project");
      const mockLog = { info: vi.fn(), error: vi.fn() };
      const longMessage = "x".repeat(1200);

      al.error(mockLog as unknown as Parameters<typeof al.error>[0], longMessage);

      const calledWith = mockLog.error.mock.calls[0]?.[0] as string;

      // The message after prefix "AUDIT_LOG: " should be truncated to 1000 chars
      expect(calledWith.startsWith("AUDIT_LOG: ")).toBe(true);
      expect(calledWith.length).toBeLessThanOrEqual(1011); // "AUDIT_LOG: " (11) + 1000
    });
  });

  describe("getLogs()", () => {
    it("returns parsed audit log entries from GCP Logging", async () => {
      const { Logging } = await import("@google-cloud/logging");
      const MockLogging = vi.mocked(Logging);

      MockLogging.mockImplementationOnce(function () {
        return {
          log: vi.fn().mockReturnValue({
            getEntries: vi.fn().mockResolvedValue([
              [
                {
                  metadata: {
                    insertId: "entry-1",
                    timestamp: new Date("2024-01-01T00:00:00Z"),
                    severity: "INFO",
                  },
                  data: { message: "AUDIT_LOG: User created testUser" },
                },
              ],
            ]),
          }),
        } as unknown as InstanceType<typeof Logging>;
      });

      const al = new AuditLogger("mock-project");
      const logs = await al.getLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0]?.id).toBe("entry-1");
      expect(logs[0]?.message).toBe("User created testUser");
      expect(logs[0]?.severity).toBe("INFO");
    });

    it("returns logs with empty fields when metadata is missing", async () => {
      const { Logging } = await import("@google-cloud/logging");
      const MockLogging = vi.mocked(Logging);

      MockLogging.mockImplementationOnce(function () {
        return {
          log: vi.fn().mockReturnValue({
            getEntries: vi.fn().mockResolvedValue([
              [
                {
                  metadata: {},
                  data: { msg: "AUDIT_LOG: test message" },
                },
              ],
            ]),
          }),
        } as unknown as InstanceType<typeof Logging>;
      });

      const al = new AuditLogger("mock-project");
      const logs = await al.getLogs();

      expect(logs[0]?.id).toBe("");
      expect(logs[0]?.timestamp).toBe("");
      expect(logs[0]?.severity).toBe("INFO");
      expect(logs[0]?.message).toBe("test message");
    });

    it("handles nested pino-formatted log data", async () => {
      const { Logging } = await import("@google-cloud/logging");
      const MockLogging = vi.mocked(Logging);

      MockLogging.mockImplementationOnce(function () {
        return {
          log: vi.fn().mockReturnValue({
            getEntries: vi.fn().mockResolvedValue([
              [
                {
                  metadata: { insertId: "id-2", timestamp: "2024-01-02", severity: "ERROR" },
                  data: { info: { msg: "AUDIT_LOG: Nested message" } },
                },
              ],
            ]),
          }),
        } as unknown as InstanceType<typeof Logging>;
      });

      const al = new AuditLogger("mock-project");
      const logs = await al.getLogs();

      expect(logs[0]?.message).toBe("Nested message");
    });

    it("returns empty message when no message fields are present", async () => {
      const { Logging } = await import("@google-cloud/logging");
      const MockLogging = vi.mocked(Logging);

      MockLogging.mockImplementationOnce(function () {
        return {
          log: vi.fn().mockReturnValue({
            getEntries: vi.fn().mockResolvedValue([
              [
                {
                  metadata: { insertId: "id-3" },
                  data: { unrelated: "stuff" },
                },
              ],
            ]),
          }),
        } as unknown as InstanceType<typeof Logging>;
      });

      const al = new AuditLogger("mock-project");
      const logs = await al.getLogs();

      expect(logs[0]?.message).toBe("");
    });

    it("reuses the cached logger client on the second call", async () => {
      const { Logging } = await import("@google-cloud/logging");
      const MockLogging = vi.mocked(Logging);
      const callCount = { value: 0 };

      MockLogging.mockImplementation(function () {
        callCount.value += 1;

        return {
          log: vi.fn().mockReturnValue({
            getEntries: vi.fn().mockResolvedValue([[]]),
          }),
        } as unknown as InstanceType<typeof Logging>;
      });

      const al = new AuditLogger("cached-project");

      await al.getLogs();
      await al.getLogs(); // second call should reuse cached logger

      // Logging constructor should only be called once (cached after first call)
      expect(callCount.value).toBe(1);

      MockLogging.mockRestore();
    });
  });
});
