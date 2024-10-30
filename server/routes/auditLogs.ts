import express, { Request, Response, Router } from "express";
import AuditLogger from "../logger/cloudLogging";
import { Auth } from "blaise-login-react/blaise-login-react-server";

export default function auditLogs(auditlogger: AuditLogger, auth: Auth): Router {
    const router = express.Router();

    const auditHandler = new AuditHandler(auditlogger, auth);
    return router.get("/api/audit", auth.Middleware, auditHandler.GetAuditLogs);
}

export class AuditHandler {
    auditLogger: AuditLogger;
    auth: Auth;

    constructor(auditLogger: AuditLogger, auth: Auth) {
        this.auditLogger = auditLogger;
        this.auth = auth;

        this.GetAuditLogs = this.GetAuditLogs.bind(this);
    }

    async GetAuditLogs(req: Request, res: Response): Promise<Response> {
        const currentUser = this.auth.GetUser(this.auth.GetToken(req));
        try {
            const logs = await this.auditLogger.getLogs();
            this.auditLogger.info(req.log, `${currentUser.name} retrieved audit logs`);
            return res.status(200).json(logs);
        } catch (error: unknown) {
            this.auditLogger.error(req.log, `${currentUser.name} failed to get audit logs`);
            return res.status(500).json(error);
        }
    }
}
