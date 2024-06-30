import express, { Request, Response, Router } from "express";
import { CustomConfig } from "../interfaces/server";
import { Auth } from "blaise-login-react/blaise-login-react-server";
import BlaiseApiClient from "blaise-api-node-client";

export default function BlaiseAPIRouter(config: CustomConfig, auth: Auth, blaiseApiClient: BlaiseApiClient): Router {
    const router = express.Router();
    router.get("/api/roles", auth.Middleware, async function (req: Request, res: Response) {
        res.status(200).json(await blaiseApiClient.getUserRoles());
    });

    router.get("/api/users", auth.Middleware, async function (req: Request, res: Response) {
        res.status(200).json(await blaiseApiClient.getUsers());
    });

    router.patch("/api/users/:user/rolesAndPermissions", auth.Middleware, async function (req: Request, res: Response) {
        const { role, currentServerParks, currentDefaultServerPark } = req.body;
        let newServerParks = currentServerParks;
        let newDefaultServerPark = currentDefaultServerPark;

        if (!req.params.user || !role) {
            return res.status(400).json("No user role provided");
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
            await blaiseApiClient.changeUserRole(req.params.user, role);
            console.log(req.params.user, newServerParks + newDefaultServerPark);
            // TODO: awaiting fix for changeUserServerParks
            // await blaiseApiClient.changeUserServerParks(req.params.user, newServerParks, newDefaultServerPark);
            const successMessage = `Successfully updated user role and permissions to ${role} for ${req.params.user} `;
            console.log(successMessage + ` at ${(new Date()).toLocaleTimeString("en-UK")} ${(new Date()).toLocaleDateString("en-UK")}`);
            return res.status(200).json({
                message: successMessage + " today at " + (new Date()).toLocaleTimeString("en-UK")
            });
        } catch (error) {
            const errorMessage = `Error whilst trying to update user role and permissions to ${role} for ${req.params.user}: ${error}`;
            console.error(errorMessage);
            return res.status(500).json({
                message: errorMessage
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
            console.error(errorMessage);
            return res.status(500).json({
                message: errorMessage,
                error: error
            });
        }
    });

    router.get("/api/change-password/:user", auth.Middleware, async function (req: Request, res: Response) {
        let { password } = req.headers;

        if (Array.isArray(password)) {
            password = password.join("");
        }

        if (!req.params.user || !password) {
            return res.status(400).json();
        }

        blaiseApiClient.changePassword(req.params.user, password).then(() => {
            return res.status(204).json(null);
        }).catch((error: unknown) => {
            console.error(error);
            return res.status(500).json(error);
        });
    });

    router.delete("/api/users", auth.Middleware, async function (req: Request, res: Response) {
        let { user } = req.headers;

        if (Array.isArray(user)) {
            user = user.join("");
        }

        if (!user) {
            return res.status(400).json();
        }
        return res.status(204).json(await blaiseApiClient.deleteUser(user));
    });

    router.post("/api/users", auth.Middleware, async function (req: Request, res: Response) {
        const data = req.body;
        if(!data.role){
            return res.status(400).json();
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
        return res.status(200).json(await blaiseApiClient.createUser(data));
    });

    return router;
}
