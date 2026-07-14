import { createAuthManager } from "./auth";

// The auth mock (setupTests) provides `createSessionKey` as (projectId) => `mock-session-${projectId}`.
// AuthManager is also mocked.

function setAppConfigScript(json: object): void {
  const existing = document.getElementById("app-config");

  if (existing) existing.remove();
  const script = document.createElement("script");

  script.id = "app-config";
  script.type = "application/json";
  script.textContent = JSON.stringify(json);
  document.body.appendChild(script);
}

describe("getAuthClientConfig", () => {
  beforeEach(() => {
    vi.resetModules();
    document.getElementById("app-config")?.remove();
  });

  afterEach(() => {
    document.getElementById("app-config")?.remove();
  });

  it("returns sessionKey derived from projectId and no cookieDomain when urlDomain is empty", async () => {
    const { getAuthClientConfig: fresh } = await import("./auth");
    const config = fresh();

    expect(config.sessionKey).toMatch(/mock-session-/);
    expect(config.cookieDomain).toBeUndefined();
  });

  it("returns sessionKey AND cookieDomain when urlDomain is non-empty", async () => {
    setAppConfigScript({
      URL_DOMAIN: "blaise.gcp.onsdigital.uk",
      PROJECT_ID: "my-project",
    });

    const { getAuthClientConfig: fresh } = await import("./auth");
    const config = fresh();

    expect(config.sessionKey).toMatch(/mock-session-/);
    expect(config.cookieDomain).toBe("blaise.gcp.onsdigital.uk");
  });
});

describe("createAuthManager", () => {
  it("returns an AuthManager instance", () => {
    const manager = createAuthManager();

    expect(manager).toBeDefined();
    expect(typeof manager.getToken).toBe("function");
    expect(typeof manager.authHeader).toBe("function");
  });
});
