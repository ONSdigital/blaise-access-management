export interface ClientConfig {
    RoleToServerParksMap: { [key: string]: string[] } ;
}
import role_to_serverparks_map_json from "./role-to-serverparks-map.json";

export function loadConfigFromEnv(): ClientConfig {
    const roleToServerParksMap: { [key: string]: string[] } = role_to_serverparks_map_json;
    return {
        RoleToServerParksMap: roleToServerParksMap
    };
}