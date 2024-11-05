// eslint-disable-next-line import/no-extraneous-dependencies
import { Logging } from "@google-cloud/logging";
import { IncomingMessage } from "http";
import { AuditLog } from "../interfaces/logger";

export default class AuditLogger {
    projectId: string;
    logger: Logging;
    logName: string;

    constructor(projectId: string) {
        this.projectId = projectId;
        this.logger = new Logging({ projectId: this.projectId });
        this.logName = `projects/${this.projectId}/logs/stdout`;
    }

    info(logger: IncomingMessage["log"], message: string): void {
        const logFormat = "AUDIT_LOG: message";
        const log = logFormat.replace("message", message);
        logger.info(log);
    }

    error(logger: IncomingMessage["log"], message: string): void {
        const logFormat = "AUDIT_LOG: message";
        const log = logFormat.replace("message", message);
        logger.error(log);
    }

    async getLogs(): Promise<AuditLog[]> {
        const auditLogs: AuditLog[] = [];
        const log = this.logger.log(this.logName);
        const [entries] = await log.getEntries({ filter: "jsonPayload.message=~\"^AUDIT_LOG: \"", maxResults: 50 });
        for (const entry of entries) {
            let id = "";
            let timestamp = "";
            let severity = "INFO";
            if (entry.metadata.insertId != null) {
                id = entry.metadata.insertId;
            }
            if (entry.metadata.timestamp != null) {
                timestamp = entry.metadata.timestamp.toString();
            }
            if (entry.metadata.severity != null) {
                severity = entry.metadata.severity.toString();
            }
            auditLogs.push({
                id: id,
                timestamp: timestamp,
                message: entry.data.message.replace(/^AUDIT_LOG: /, ""),
                severity: severity
            });
        }
        return auditLogs;
    }
}
