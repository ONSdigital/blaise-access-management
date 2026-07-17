export interface ClientConfig {
  DefaultServerPark: string;
  RoleToServerParksMap: { [key: string]: string[] };
}
import { getClientRuntimeEnv } from "./env";

export function loadClientConfigFromRuntimeEnv(): ClientConfig {
  const runtimeEnv = getClientRuntimeEnv();

  return {
    DefaultServerPark: runtimeEnv.defaultServerPark,
    RoleToServerParksMap: runtimeEnv.roleToServerParksMap,
  };
}
