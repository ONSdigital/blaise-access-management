import { AuthManager, createSessionKey } from "blaise-login-react-client";

import { getClientRuntimeEnv } from "./env";

interface AuthClientConfig {
  sessionKey: string;
  cookieDomain?: string;
}

export function getAuthClientConfig(): AuthClientConfig {
  const runtimeEnv = getClientRuntimeEnv();
  const projectId = runtimeEnv.projectId.trim();
  const sessionKey = createSessionKey(projectId || "local");
  const cookieDomain = runtimeEnv.urlDomain.trim();

  if (!cookieDomain) {
    return { sessionKey };
  }

  return {
    sessionKey,
    cookieDomain,
  };
}

export function createAuthManager(): AuthManager {
  return new AuthManager(getAuthClientConfig());
}
