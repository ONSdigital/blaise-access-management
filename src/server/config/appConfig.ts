import roleToServerParksMapJson from "./role-to-server-parks-map.json" with { type: "json" };

import type { CustomConfig } from "../types/server.types.js";

const SESSION_TIMEOUT = "12h";
const ALLOWED_ROLES = ["DST"];

const requiredEnvVariables = [
  "PROJECT_ID",
  "BLAISE_API_URL",
  "SERVER_PARK",
  "URL_DOMAIN",
  "SESSION_SECRET",
] as const;

type RequiredEnvKey = (typeof requiredEnvVariables)[number];
type ResolvedRequiredEnv = Record<RequiredEnvKey, string>;

function isUndefinedOrPlaceholder(name: string, value: string | undefined): boolean {
  return value === undefined || value.trim() === "" || value === `_${name}`;
}

export function assertResolvedRequiredEnv(
  env: NodeJS.ProcessEnv,
): asserts env is NodeJS.ProcessEnv & ResolvedRequiredEnv {
  const missing = requiredEnvVariables.filter((name) => isUndefinedOrPlaceholder(name, env[name]));

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

export function loadServerConfigFromEnv(): CustomConfig {
  assertResolvedRequiredEnv(process.env);

  const { PROJECT_ID, BLAISE_API_URL, SERVER_PARK, URL_DOMAIN, SESSION_SECRET } = process.env;

  const roleToServerParksMap: { [key: string]: string[] } = roleToServerParksMapJson;

  return {
    BlaiseApiUrl: fixUrl(BLAISE_API_URL),
    ProjectId: PROJECT_ID,
    ServerPark: SERVER_PARK,
    TokenIssuer: PROJECT_ID,
    Roles: ALLOWED_ROLES,
    SessionTimeout: SESSION_TIMEOUT,
    SessionSecret: SESSION_SECRET,
    URLDomain: URL_DOMAIN,
    RoleToServerParksMap: roleToServerParksMap,
  };
}

function fixUrl(url: string): string {
  if (url.startsWith("http")) {
    return url;
  }

  return `http://${url}`;
}
