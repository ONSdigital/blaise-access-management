import { assertResolvedRequiredEnv, loadConfigFromEnv } from "./appConfig.js";

describe("Config setup", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      PROJECT_ID: "mock-project",
      BLAISE_API_URL: "http://mock",
      SERVER_PARK: "mock-server-park",
      URL_DOMAIN: "blaise.gcp.onsdigital.uk",
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env = originalEnv;
  });

  it("should return the correct environment variables", () => {
    const config = loadConfigFromEnv();

    expect(config.ProjectId).toBe("mock-project");
    expect(config.ServerPark).toBe("mock-server-park");
    expect(config.BlaiseApiUrl).toBe("http://mock");
    expect(config.URLDomain).toBe("blaise.gcp.onsdigital.uk");
    expect(config.RoleToServerParksMap).not.toBeNull();
  });

  it("should use a default session timeout when SESSION_TIMEOUT is not set", () => {
    delete process.env.SESSION_TIMEOUT;

    const config = loadConfigFromEnv();

    expect(config.SessionTimeout).toBe("12h");
  });

  it("should throw when required environment variables are missing", () => {
    delete process.env.URL_DOMAIN;

    expect(() => loadConfigFromEnv()).toThrow("Missing required environment variables: URL_DOMAIN");
  });

  it("should throw when required environment variables are unresolved placeholders", () => {
    process.env.BLAISE_API_URL = "_BLAISE_API_URL";

    expect(() => assertResolvedRequiredEnv(process.env)).toThrow(
      "Missing required environment variables: BLAISE_API_URL",
    );
  });

  it("should prefix the BLAISE_API_URL with http:// when it does not start with http", () => {
    process.env.BLAISE_API_URL = "blaise-api:8080";

    const config = loadConfigFromEnv();

    expect(config.BlaiseApiUrl).toBe("http://blaise-api:8080");
  });

  it("should use custom ROLES when provided", () => {
    process.env.ROLES = "DST,BDSS,IPS Manager";

    const config = loadConfigFromEnv();

    expect(config.Roles).toEqual(["DST", "BDSS", "IPS Manager"]);
  });

  it("should default ROLES to DST when ROLES is empty", () => {
    process.env.ROLES = "";

    const config = loadConfigFromEnv();

    expect(config.Roles).toEqual(["DST"]);
  });

  it("should default ROLES to DST when ROLES is the placeholder _ROLES", () => {
    process.env.ROLES = "_ROLES";

    const config = loadConfigFromEnv();

    expect(config.Roles).toEqual(["DST"]);
  });

  it("should use provided SESSION_SECRET", () => {
    process.env.SESSION_SECRET = "my-secret-key";

    const config = loadConfigFromEnv();

    expect(config.SessionSecret).toBe("my-secret-key");
  });

  it("should generate a random SESSION_SECRET when it is the placeholder", () => {
    process.env.SESSION_SECRET = "_SESSION_SECRET";

    const config = loadConfigFromEnv();

    // Generated secret should be a hex string of 40 chars (20 bytes)
    expect(config.SessionSecret).toMatch(/^[a-f0-9]{40}$/);
  });

  it("should generate a random SESSION_SECRET when it is empty", () => {
    process.env.SESSION_SECRET = "";

    const config = loadConfigFromEnv();

    expect(config.SessionSecret).toMatch(/^[a-f0-9]{40}$/);
  });
});
