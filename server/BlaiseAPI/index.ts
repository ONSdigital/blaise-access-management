import express, { Request, Response, Router } from "express";
import { Config } from "../Config";
import { Auth } from "blaise-login-react-server";
import BlaiseApiClient from "blaise-api-node-client";

export default function BlaiseAPIRouter(config: Config, auth: Auth, blaiseApiClient: BlaiseApiClient): Router {
    const router = express.Router();

    router.get("/api/roles", auth.Middleware, async function (req: Request, res: Response) {
        res.status(200).json(await blaiseApiClient.getUserRoles());
    });

    router.get("/api/users", auth.Middleware, async function (req: Request, res: Response) {
        res.status(200).json(await blaiseApiClient.getUsers());
    });

    router.get("/api/change_password/:user", auth.Middleware, async function (req: Request, res: Response) {
        console.log("change_password");
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
        console.log("delete_user");
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
        console.log("add user");
        const data = req.body;
        console.log(data);
        data.serverParks = [config.ServerPark];
        data.defaultServerPark = config.ServerPark;


        return res.status(200).json(await blaiseApiClient.createUser(data));
    });

    return router;
}
