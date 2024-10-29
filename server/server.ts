import express, { Request, Response } from "express";
import axios from "axios";
import path from "path";
import ejs from "ejs";
import createLogger from "./pino";
import BlaiseAPIRouter from "./BlaiseAPI";
import multer from "multer";
import * as profiler from "@google-cloud/profiler";
import { newLoginHandler, Auth } from "blaise-login-react/blaise-login-react-server";
import { CustomConfig } from "./interfaces/server";
import BlaiseApi from "blaise-api-node-client";
import { Express } from "express";
import fs from "fs";
import AuditLogger from "./AuditLogger";

export default function GetNodeServer(config: CustomConfig, blaiseApi: BlaiseApi, auth: Auth): Express
{
    const pinoLogger = createLogger();
    profiler.start({ logLevel: 4 }).catch((err: unknown) => {
        pinoLogger.logger.error(`Failed to start profiler: ${err}`);
    });

    const upload = multer();
    const server = express();
    const logger = createLogger();

    server.use(upload.any());
    server.use(logger);
    axios.defaults.timeout = 10000;

    // where ever the react built package is
    const buildFolder = "../build";
    const auditLogger = new AuditLogger(config.ProjectId);
    const loginHandler = newLoginHandler(auth, blaiseApi);

    // Health Check endpoint
    server.get("/bam-ui/:version/health", async function (req: Request, res: Response) {
        auditLogger.info(req.log, "Heath Check endpoint called");
        req.log.info("Heath Check endpoint called");
        res.status(200).json({ healthy: true });
    });

    server.use("/", loginHandler);

    // All Endpoints calling the Blaise API
    server.use("/", BlaiseAPIRouter(config, auth, blaiseApi, auditLogger));

    // treat the index.html as a template and substitute the values at runtime
    server.set("views", path.join(__dirname, "/views"));
    server.engine("html", ejs.renderFile);
    server.use(
        "/static",
        express.static(path.join(__dirname, `${buildFolder}/static`))
    );

    let indexFilePath = path.join(__dirname, `${buildFolder}/index.html`);
    if (!fs.existsSync(indexFilePath)) {
        indexFilePath = path.join(__dirname, "../public/index.html");
    }

    server.get("*", function (_req: Request, res: Response) {
        res.render(indexFilePath);
    });

    server.use(function (err, _req, res, _next) {
        if (err && err.stack) {
            auditLogger.error(res, err.stack);
            console.error(err.stack);
        } else {
            auditLogger.error(res, "An undefined error occurred");
            console.error("An undefined error occurred");
        }
        res.render("../views/500.html", {});
    });

    return server;
}
