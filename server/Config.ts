import crypto from "crypto";
import { AuthConfig } from "blaise-login-react-server";

export interface Config extends AuthConfig {
    BlaiseApiUrl: string
    ProjectId: string
    ServerPark: string
    CatiDashboardUrl: string
}

export function loadConfigFromEnv(): Config {
    let { PROJECT_ID, BLAISE_API_URL, SERVER_PARK, VM_EXTERNAL_WEB_URL, SESSION_TIMEOUT } = process.env;
    const { ROLES, SESSION_SECRET } = process.env;

    const CATI_DASHBOARD_URL = "https://" + VM_EXTERNAL_WEB_URL + "/Blaise";

    if (BLAISE_API_URL === undefined) {
        console.error("BLAISE_API_URL environment variable has not been set");
        BLAISE_API_URL = "ENV_VAR_NOT_SET";
    }

    if (VM_EXTERNAL_WEB_URL === undefined) {
        console.error("VM_EXTERNAL_WEB_URL environment variable has not been set");
        VM_EXTERNAL_WEB_URL = "VM_EXTERNAL_WEB_URL";
    }

    if (PROJECT_ID === undefined) {
        console.error("PROJECT_ID environment variable has not been set");
        PROJECT_ID = "ENV_VAR_NOT_SET";
    }

    if (SERVER_PARK === undefined) {
        console.error("SERVER_PARK environment variable has not been set");
        SERVER_PARK = "ENV_VAR_NOT_SET";
    }

    if (SESSION_TIMEOUT === undefined || SESSION_TIMEOUT === "_SESSION_TIMEOUT") {
        console.log("SESSION_TIMEOUT environment variable has not been set, using default of 12h");
        SESSION_TIMEOUT = "12h";
    }

    return {
        BlaiseApiUrl: fixURL(BLAISE_API_URL),
        ProjectId: PROJECT_ID,
        ServerPark: SERVER_PARK,
        CatiDashboardUrl: CATI_DASHBOARD_URL,
        Roles: loadRoles(ROLES),
        SessionTimeout: SESSION_TIMEOUT,
        SessionSecret: sessionSecret(SESSION_SECRET)
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
