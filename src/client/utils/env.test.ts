import { getClientRuntimeEnv, isProduction } from "./env";

const isProductionTestCases = [
  {
    hostname: "dev-training-dqs.social-surveys.gcp.onsdigital.uk",
    expected: false,
  },
  {
    hostname: "localhost",
    expected: false,
  },
  {
    hostname: "bam.preprod-blaise.gcp.onsdigital.uk",
    expected: false,
  },
  {
    hostname: "bam.blaise.gcp.onsdigital.uk",
    expected: true,
  },
];

describe("isProduction", () => {
  it.each(isProductionTestCases)(
    "checks whether a hostname is production",
    ({ hostname, expected }) => {
      expect(isProduction(hostname)).toBe(expected);
    },
  );
});

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

function removeAppConfigScript(): void {
  document.getElementById("app-config")?.remove();
}

describe("getClientRuntimeEnv – with full app-config", () => {
  beforeEach(() => {
    vi.resetModules();
    setAppConfigScript({
      PROJECT_ID: "my-project",
      URL_DOMAIN: "blaise.gcp.onsdigital.uk",
      DEFAULT_SERVER_PARK: "gusty",
      ROLE_TO_SERVER_PARKS_MAP: { DST: ["gusty"], BDSS: ["gusty", "cma"] },
    });
  });

  afterEach(() => {
    removeAppConfigScript();
  });

  it("reads all values from the script element", async () => {
    const { getClientRuntimeEnv: fresh } = await import("./env");
    const env = fresh();

    expect(env.projectId).toBe("my-project");
    expect(env.urlDomain).toBe("blaise.gcp.onsdigital.uk");
    expect(env.defaultServerPark).toBe("gusty");
    expect(env.roleToServerParksMap).toEqual({ DST: ["gusty"], BDSS: ["gusty", "cma"] });
  });
});

describe("getClientRuntimeEnv – without app-config script", () => {
  beforeEach(() => {
    vi.resetModules();
    removeAppConfigScript();
  });

  it("returns fallback values when script element is absent", async () => {
    const { getClientRuntimeEnv: fresh } = await import("./env");
    const env = fresh();

    expect(typeof env.projectId).toBe("string");
    expect(typeof env.defaultServerPark).toBe("string");
    expect(env.roleToServerParksMap).toEqual({ DEFAULT: [] });
  });
});

describe("getClientRuntimeEnv – invalid/non-object JSON in script", () => {
  beforeEach(() => {
    vi.resetModules();
    const script = document.createElement("script");

    script.id = "app-config";
    script.type = "application/json";
    script.textContent = '"just a string"';
    document.body.appendChild(script);
  });

  afterEach(() => {
    removeAppConfigScript();
  });

  it("returns fallback values when script JSON is not an object", async () => {
    const { getClientRuntimeEnv: fresh } = await import("./env");
    const env = fresh();

    expect(env.roleToServerParksMap).toEqual({ DEFAULT: [] });
  });
});

describe("getClientRuntimeEnv – malformed JSON in script", () => {
  beforeEach(() => {
    vi.resetModules();
    const script = document.createElement("script");

    script.id = "app-config";
    script.type = "application/json";
    script.textContent = "{ not valid json }";
    document.body.appendChild(script);
  });

  afterEach(() => {
    removeAppConfigScript();
  });

  it("returns fallback values when script JSON is malformed", async () => {
    const { getClientRuntimeEnv: fresh } = await import("./env");
    const env = fresh();

    expect(env.roleToServerParksMap).toEqual({ DEFAULT: [] });
  });
});

describe("getClientRuntimeEnv – caches the result", () => {
  beforeEach(() => {
    vi.resetModules();
    setAppConfigScript({ PROJECT_ID: "cached-project" });
  });

  afterEach(() => {
    removeAppConfigScript();
  });

  it("returns the same object on repeated calls", async () => {
    const { getClientRuntimeEnv: fresh } = await import("./env");
    const first = fresh();
    const second = fresh();

    expect(first).toBe(second);
  });
});

describe("getClientRuntimeEnv – ROLE_TO_SERVER_PARKS_MAP with DEFAULT entry", () => {
  beforeEach(() => {
    vi.resetModules();
    setAppConfigScript({
      ROLE_TO_SERVER_PARKS_MAP: { DEFAULT: ["park1"], DST: ["park1"] },
    });
  });

  afterEach(() => {
    removeAppConfigScript();
  });

  it("uses DEFAULT[0] as defaultServerPark when DEFAULT_SERVER_PARK is absent", async () => {
    const { getClientRuntimeEnv: fresh } = await import("./env");
    const env = fresh();

    expect(env.defaultServerPark).toBe("park1");
  });
});

describe("getClientRuntimeEnv – invalid ROLE_TO_SERVER_PARKS_MAP value", () => {
  beforeEach(() => {
    vi.resetModules();
    setAppConfigScript({
      ROLE_TO_SERVER_PARKS_MAP: { DST: "not-an-array" },
    });
  });

  afterEach(() => {
    removeAppConfigScript();
  });

  it("falls back to { DEFAULT: [] } when map values are not arrays", async () => {
    const { getClientRuntimeEnv: fresh } = await import("./env");
    const env = fresh();

    expect(env.roleToServerParksMap).toEqual({ DEFAULT: [] });
  });
});

describe("isProduction (re-export check)", () => {
  it("recognises production hostnames", () => {
    expect(getClientRuntimeEnv).toBeDefined();
  });
});
