// The auth mock provides getClientRuntimeEnv via env.ts.
// We set up a script element to give it known values.

function setAppConfigScript(json: object): void {
  const existing = document.getElementById("app-config");

  if (existing) {
    existing.remove();
  }

  const script = document.createElement("script");

  script.id = "app-config";
  script.type = "application/json";
  script.textContent = JSON.stringify(json);
  document.body.appendChild(script);
}

describe("loadConfigFromEnv", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    document.getElementById("app-config")?.remove();
  });

  it("maps DefaultServerPark and RoleToServerParksMap from runtime env", async () => {
    setAppConfigScript({
      DEFAULT_SERVER_PARK: "gusty",
      ROLE_TO_SERVER_PARKS_MAP: { DST: ["gusty"] },
    });

    const { loadConfigFromEnv: fresh } = await import("./clientConfig");
    const config = fresh();

    expect(config.DefaultServerPark).toBe("gusty");
    expect(config.RoleToServerParksMap).toEqual({ DST: ["gusty"] });
  });

  it("returns empty defaultServerPark when config is missing", async () => {
    const { loadConfigFromEnv: fresh } = await import("./clientConfig");
    const config = fresh();

    expect(typeof config.DefaultServerPark).toBe("string");
    expect(config.RoleToServerParksMap).toBeDefined();
  });
});
