import express, { Request, Response } from "express";
import axios from "axios";
import path from "path";
import ejs from "ejs";
import multer from "multer";
import * as profiler from "@google-cloud/profiler";
import { newLoginHandler, Auth } from "blaise-login-react/blaise-login-react-server";
import { CustomConfig } from "./interfaces/server";
import BlaiseApi from "blaise-api-node-client";
import { Express } from "express";
import fs from "fs";
import AuditLogger from "./logger/cloudLogging";
import blaiseApi from "./routes/blaiseApi";
import { HttpLogger } from "pino-http";

export default function GetNodeServer(config: CustomConfig, blaiseApiClient: BlaiseApi, auth: Auth, logger: HttpLogger): Express
{
    const auditLogger = new AuditLogger(config.ProjectId);
    const pinoLogger = logger;
    const upload = multer();
    const server = express();
    // where ever the react built package is
    const buildFolder = "../build";

    server.use(upload.any());
    server.use(pinoLogger);
    server.use(express.json());
    axios.defaults.timeout = 10000;

    const loginRouter = newLoginHandler(auth, blaiseApiClient);
    const blaiseApiRouter = blaiseApi(config, auth, blaiseApiClient, auditLogger);

    profiler.start({ logLevel: 4 }).catch((err: unknown) => {
        pinoLogger.logger.info(`Failed to start GCP profiler: ${err}`);
    });
    // GCP health check
    server.get("/bam-ui/:version/health", async function (req: Request, res: Response) {
        auditLogger.info(req.log, "Heath Check endpoint called");
        res.status(200).json({ healthy: true });
    });
    server.use("/", loginRouter);
    server.use("/", blaiseApiRouter);

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
