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

    router.get("/api/change_password/:user", auth.Middleware, async function (req: Request, res: Response) {
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
            return res.status(500).json();
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
        console.log(req.body);
        const data = req.body;
        console.log(config.ServerPark);
        data.serverParks = [config.ServerPark];
        data.defaultServerPark = config.ServerPark;
        console.log("role is " + data.role);
        if (data.role.includes("IPS")) {
            console.log("Inside IF statement");
            console.log("serverParks is " + data.serverParks);
            console.log("defaultServerpark is " + data.defaultServerPark);
            data.serverParks.push("CMA");
            data.defaultServerPark + "CMA";
        }
        console.log("serverParks is " + data.serverParks);
        console.log("defaultServerpark is " + data.defaultServerPark);

        return res.status(200).json(await blaiseApiClient.createUser(data));
    });

    return router;
}
