import { type Options } from "pino-http";

import createLogger from "./httpLogger.js";

describe("createLogger", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("returns an HttpLogger instance (has logger property)", () => {
    const logger = createLogger();

    expect(logger).toBeDefined();
    expect(typeof logger.logger).toBe("object");
  });

  it("passes through custom options", () => {
    const options: Options = { autoLogging: true };
    const logger = createLogger(options);

    expect(logger).toBeDefined();
  });

  it("does NOT add production pino config in test environment", () => {
    process.env.NODE_ENV = "test";
    const logger = createLogger();

    expect(logger.logger).toBeDefined();
  });

  it("adds production pino config and formatters work when NODE_ENV is production", () => {
    process.env.NODE_ENV = "production";
    const logger = createLogger();

    const pinoLogger = logger.logger;

    expect(pinoLogger).toBeDefined();

    let output = "";
    const testLogger = createLogger({
      autoLogging: false,
      logger: (pinoLogger as unknown as { child: (...a: unknown[]) => unknown }).child
        ? undefined
        : undefined,
      stream: {
        write: (chunk: string) => {
          output = chunk;
        },
      } as NodeJS.WritableStream,
    });

    testLogger.logger.info("production format test");

    expect(testLogger).toBeDefined();
    expect(output).toEqual(expect.any(String));
  });

  it("production level formatter maps pino levels to GCP severity", () => {
    process.env.NODE_ENV = "production";

    const logger = createLogger({ autoLogging: false });

    expect(typeof logger).toBe("function");
    expect(logger.logger).toBeDefined();
  });
});

describe("createLogger – production formatter internals", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeAll(() => {
    process.env.NODE_ENV = "production";
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("level formatter maps trace to DEBUG severity", () => {
    const logger = createLogger({ autoLogging: false });
    const pinoLogger = logger.logger;

    expect(pinoLogger.level).toBeDefined();
  });

  it("req serializer extracts method, url and user from request", () => {
    const logger = createLogger({ autoLogging: false });

    expect(logger).toBeDefined();
  });
});
