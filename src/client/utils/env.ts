export interface ClientRuntimeEnv {
  projectId: string;
  urlDomain: string;
  defaultServerPark: string;
  roleToServerParksMap: { [key: string]: string[] };
}

interface RawClientConfig {
  PROJECT_ID?: unknown;
  URL_DOMAIN?: unknown;
  DEFAULT_SERVER_PARK?: unknown;
  ROLE_TO_SERVER_PARKS_MAP?: unknown;
}

let cachedRuntimeEnv: ClientRuntimeEnv | undefined;

export function isProduction(hostname: string): boolean {
  return hostname.endsWith(".blaise.gcp.onsdigital.uk");
}

function isRoleToServerParkMap(value: unknown): value is { [key: string]: string[] } {
  if (!value || typeof value !== "object") {
    return false;
  }

  return Object.values(value).every((entry) => {
    return Array.isArray(entry) && entry.every((item) => typeof item === "string");
  });
}

function getScriptJson(): RawClientConfig {
  if (typeof document === "undefined") {
    return {};
  }

  const scriptElement = document.getElementById("app-config");

  if (!scriptElement?.textContent) {
    return {};
  }

  try {
    const parsed = JSON.parse(scriptElement.textContent) as unknown;

    if (parsed && typeof parsed === "object") {
      return parsed as RawClientConfig;
    }

    return {};
  } catch {
    return {};
  }
}

function getStringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

export function getClientRuntimeEnv(): ClientRuntimeEnv {
  if (cachedRuntimeEnv) {
    return cachedRuntimeEnv;
  }

  const rawConfig = getScriptJson();
  const fallbackRoleToServerParksMap: { [key: string]: string[] } = { DEFAULT: [] };
  const roleToServerParksMap = isRoleToServerParkMap(rawConfig.ROLE_TO_SERVER_PARKS_MAP)
    ? rawConfig.ROLE_TO_SERVER_PARKS_MAP
    : fallbackRoleToServerParksMap;

  const defaultServerPark =
    getStringValue(rawConfig.DEFAULT_SERVER_PARK) ?? roleToServerParksMap["DEFAULT"]?.[0] ?? "";

  cachedRuntimeEnv = {
    projectId: getStringValue(rawConfig.PROJECT_ID) ?? import.meta.env.VITE_PROJECT_ID ?? "",
    urlDomain: getStringValue(rawConfig.URL_DOMAIN) ?? import.meta.env.VITE_URL_DOMAIN ?? "",
    defaultServerPark,
    roleToServerParksMap,
  };

  return cachedRuntimeEnv;
}
