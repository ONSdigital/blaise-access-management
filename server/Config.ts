import crypto from "crypto";
import pino from "pino";
import { CustomConfig } from "./Interfaces/server";

export function loadConfigFromEnv(): CustomConfig {
    let { PROJECT_ID, BLAISE_API_URL, SERVER_PARK, SESSION_TIMEOUT } = process.env;
    const { ROLES, SESSION_SECRET } = process.env;
    const logger = pino();

    if (BLAISE_API_URL === undefined) {
        logger.error("BLAISE_API_URL environment variable has not been set");
        BLAISE_API_URL = "ENV_VAR_NOT_SET";
    }

    if (PROJECT_ID === undefined) {
        logger.error("PROJECT_ID environment variable has not been set");
        PROJECT_ID = "ENV_VAR_NOT_SET";
    }

    if (SERVER_PARK === undefined) {
        logger.error("SERVER_PARK environment variable has not been set");
        SERVER_PARK = "ENV_VAR_NOT_SET";
    }

    if (SESSION_TIMEOUT === undefined || SESSION_TIMEOUT === "_SESSION_TIMEOUT") {
        logger.info("SESSION_TIMEOUT environment variable has not been set, using default of 12h");
        SESSION_TIMEOUT = "12h";
    }

    return {
        BlaiseApiUrl: fixURL(BLAISE_API_URL),
        ProjectId: PROJECT_ID,
        ServerPark: SERVER_PARK,
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
