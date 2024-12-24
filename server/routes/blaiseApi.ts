import express, { Request, Response, Router } from "express";
import { CustomConfig } from "../interfaces/server";
import { Auth } from "blaise-login-react/blaise-login-react-server";
import BlaiseApiClient from "blaise-api-node-client";
import AuditLogger from "../logger/cloudLogging";

export default function blaiseApi(config: CustomConfig, auth: Auth, blaiseApiClient: BlaiseApiClient, auditLogger: AuditLogger): Router {
    const router = express.Router();

    router.get("/api/roles", auth.Middleware, async function (req: Request, res: Response) {
        res.status(200).json(await blaiseApiClient.getUserRoles());
    });

    router.get("/api/users", auth.Middleware, async function (req: Request, res: Response) {
        res.status(200).json(await blaiseApiClient.getUsers());
    });

    router.patch("/api/users/:user/rolesAndPermissions", auth.Middleware, async function (req: Request, res: Response) {
        const currentUser = auth.GetUser(auth.GetToken(req));
        const { role } = req.body;
        const user = req.params.user;
        let newServerParks: string[];
        let newDefaultServerPark: string;

        if (!user || !role) {
            return res.status(400).json("No user or role provided");
        }

        const roleServerParksOverride = config.RoleToServerParksMap[role];
        if (roleServerParksOverride != null) {
            newServerParks = roleServerParksOverride;
            newDefaultServerPark = roleServerParksOverride[0];
        } else {
            const defaultServerPark = config.RoleToServerParksMap["DEFAULT"];
            newServerParks = defaultServerPark;
            newDefaultServerPark = defaultServerPark[0];
        }

        try {
            await blaiseApiClient.changeUserRole(user, role);
            await blaiseApiClient.changeUserServerParks(user, newServerParks, newDefaultServerPark);
            const successMessage = `${currentUser.name || "Unknown user"} has successfully updated user role and permissions to ${role} for ${user}`;
            auditLogger.info(req.log, successMessage);
            return res.status(200).json({
                message: "Successfully updated user role and permissions to " + role + " for " + user
            });
        } catch (error) {
            const errorMessage = `Error whilst trying to update user role and permissions to ${role} for ${req.params.user}, with error message: ${error}`;
            auditLogger.info(req.log, `${currentUser.name || "Unknown user"} has failed to update user role and permissions to ${role} for ${user}`);
            auditLogger.error(req.log, errorMessage);
            return res.status(500).json({
                message: "Failed to update user role and permissions to " + role + " for " + user
            });
        }
    });

    router.get("/api/users/:user", auth.Middleware, async function (req: Request, res: Response) {
        if (!req.params.user) {
            return res.status(400).json("No user provided");
        }

        try {
            const user = await blaiseApiClient.getUser(req.params.user);
            const successMessage = `Successfully fetched user details for ${req.params.user}`;
            return res.status(200).json({
                message: successMessage,
                data: user
            });
        } catch (error) {
            const errorMessage = `Error whilst trying to retrieve user ${req.params.user}: ${error}`;
            return res.status(500).json({
                message: errorMessage,
                error: error
            });
        }
    });

    router.post("/api/change-password/:user", auth.Middleware, async function (req: Request, res: Response) {
        const currentUser = auth.GetUser(auth.GetToken(req));
        const data = req.body;

        if (Array.isArray(data.password)) {
            data.password = data.password.join("");
        }

        if (!req.params.user || !data.password) {
            return res.status(400).json("No user or password provided");
        }

        blaiseApiClient.changePassword(req.params.user, data.password).then(() => {
            auditLogger.info(req.log, `${currentUser.name || "Unknown"} has successfully changed the password for ${req.params.user}`);
            return res.status(204).json(null);
        }).catch((error: unknown) => {
            auditLogger.info(req.log, `${currentUser.name || "Unknown"} has failed to change the password for ${req.params.user}`);
            auditLogger.error(req.log, `Error whilst trying to change password for ${req.params.user}: ${error}`);
            return res.status(500).json(error);
        });
    });

    router.delete("/api/users", auth.Middleware, async function (req: Request, res: Response) {
        try {
            const currentUser = auth.GetUser(auth.GetToken(req));
            let { user } = req.headers;

            if (Array.isArray(user)) {
                user = user.join("");
            }

            if (!user) {
                auditLogger.error(req.log, "No user provided for deletion");
                return res.status(400).json();
            }
            auditLogger.info(req.log, `${currentUser.name || "Unknown"} has successfully deleted user called ${user}`);
            return res.status(204).json(await blaiseApiClient.deleteUser(user));
        } catch (error) {
            auditLogger.error(req.log, `Error whilst trying to delete user, ${req.headers.user}, with error message: ${error}`);
            return res.status(500).json(error);
        }
    });

    router.post("/api/users", auth.Middleware, async function (req: Request, res: Response) {
        try {
            const currentUser = auth.GetUser(auth.GetToken(req));
            const data = req.body;

            if (!data.role) {
                return res.status(400).json({ message: "No role provided for user creation" });
            }

            const roleServerParksOverride = config.RoleToServerParksMap[data.role];
            if (roleServerParksOverride != null) {
                data.serverParks = roleServerParksOverride;
                data.defaultServerPark = roleServerParksOverride[0];
            } else {
                const defaultServerPark = config.RoleToServerParksMap["DEFAULT"];
                data.serverParks = defaultServerPark;
                data.defaultServerPark = defaultServerPark[0];
            }
            auditLogger.info(req.log, `${currentUser.name || "Unknown"} has successfully created user, ${data.name}, with an assigned role of ${data.role}`);
            return res.status(200).json(await blaiseApiClient.createUser(data));
        } catch (error) {
            auditLogger.error(req.log, `Error whilst trying to create new user, ${req.body.name}, with error message: ${error}`);
            return res.status(500).json(error);
        }
    });

    return router;
}
