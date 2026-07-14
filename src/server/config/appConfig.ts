import crypto from "crypto";

import role_to_server_parks_map_json from "./role-to-server-parks-map.json" with { type: "json" };

import type { CustomConfig } from "../types/server.types.js";

const requiredEnvVariables = ["PROJECT_ID", "BLAISE_API_URL", "SERVER_PARK", "URL_DOMAIN"] as const;

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

export function loadConfigFromEnv(): CustomConfig {
  assertResolvedRequiredEnv(process.env);

  const { PROJECT_ID, BLAISE_API_URL, SERVER_PARK, URL_DOMAIN } = process.env;
  const { SESSION_TIMEOUT } = process.env;
  const { ROLES, SESSION_SECRET } = process.env;

  const resolvedSessionTimeout = (
    isUndefinedOrPlaceholder("SESSION_TIMEOUT", SESSION_TIMEOUT) ? "12h" : SESSION_TIMEOUT
  ) as CustomConfig["SessionTimeout"];

  const roleToServerParksMap: { [key: string]: string[] } = role_to_server_parks_map_json;

  return {
    BlaiseApiUrl: fixURL(BLAISE_API_URL),
    ProjectId: PROJECT_ID,
    ServerPark: SERVER_PARK,
    TokenIssuer: PROJECT_ID,
    Roles: loadRoles(ROLES),
    SessionTimeout: resolvedSessionTimeout,
    SessionSecret: sessionSecret(SESSION_SECRET),
    URLDomain: URL_DOMAIN,
    RoleToServerParksMap: roleToServerParksMap,
  };
}

function fixURL(url: string): string {
  if (url.startsWith("http")) {
    return url;
  }

  return `http://${url}`;
}

function loadRoles(roles: string | undefined): string[] {
  if (!roles || roles === "" || roles === "_ROLES") {
    return ["DST"];
  }

  return roles.split(",");
}

function sessionSecret(secret: string | undefined): string {
  if (!secret || secret === "" || secret === "_SESSION_SECRET") {
    return crypto.randomBytes(20).toString("hex");
  }

  return secret;
}
