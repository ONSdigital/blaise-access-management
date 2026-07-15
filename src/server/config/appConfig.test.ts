import { assertResolvedRequiredEnv, loadServerConfigFromEnv } from "./appConfig.js";

describe("Config setup", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      PROJECT_ID: "mock-project",
      BLAISE_API_URL: "http://mock",
      SERVER_PARK: "mock-server-park",
      URL_DOMAIN: "blaise.gcp.onsdigital.uk",
      SESSION_SECRET: "mock-session-secret",
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env = originalEnv;
  });

  it("should return the correct environment variables", () => {
    const config = loadServerConfigFromEnv();

    expect(config.ProjectId).toBe("mock-project");
    expect(config.ServerPark).toBe("mock-server-park");
    expect(config.BlaiseApiUrl).toBe("http://mock");
    expect(config.URLDomain).toBe("blaise.gcp.onsdigital.uk");
    expect(config.RoleToServerParksMap).not.toBeNull();
  });

  it("should use a default session timeout when SESSION_TIMEOUT is not set", () => {
    delete process.env.SESSION_TIMEOUT;

    const config = loadServerConfigFromEnv();

    expect(config.SessionTimeout).toBe("12h");
  });

  it("should throw when required environment variables are missing", () => {
    delete process.env.URL_DOMAIN;

    expect(() => loadServerConfigFromEnv()).toThrow(
      "Missing required environment variables: URL_DOMAIN",
    );
  });

  it("should throw when SESSION_SECRET is missing", () => {
    delete process.env.SESSION_SECRET;

    expect(() => loadServerConfigFromEnv()).toThrow(
      "Missing required environment variables: SESSION_SECRET",
    );
  });

  it("should throw when required environment variables are unresolved placeholders", () => {
    process.env.BLAISE_API_URL = "_BLAISE_API_URL";

    expect(() => assertResolvedRequiredEnv(process.env)).toThrow(
      "Missing required environment variables: BLAISE_API_URL",
    );
  });

  it("should throw when SESSION_SECRET is an unresolved placeholder", () => {
    process.env.SESSION_SECRET = "_SESSION_SECRET";

    expect(() => assertResolvedRequiredEnv(process.env)).toThrow(
      "Missing required environment variables: SESSION_SECRET",
    );
  });

  it("should prefix the BLAISE_API_URL with http:// when it does not start with http", () => {
    process.env.BLAISE_API_URL = "blaise-api:8080";

    const config = loadServerConfigFromEnv();

    expect(config.BlaiseApiUrl).toBe("http://blaise-api:8080");
  });

  it("should return the hardcoded ALLOWED_ROLES", () => {
    const config = loadServerConfigFromEnv();

    expect(config.Roles).toEqual(["DST"]);
  });
});
