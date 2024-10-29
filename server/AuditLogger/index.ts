import { Logging } from "@google-cloud/logging";
import { IncomingMessage } from "http";

export interface AuditLog {
    id: string;
    timestamp: string;
    message: string;
    severity: string;
}

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
        logger.info(`AUDIT_LOG: ${message}`);
    }

    error(logger: IncomingMessage["log"], message: string): void {
        logger.error(`AUDIT_LOG: ${message}`);
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
