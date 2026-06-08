import { IncomingMessage } from "http";
import { AuditLog } from "../interfaces/logger";

type LoggingClient = import("@google-cloud/logging").Logging;

export function formatLogMessage(text: string): string {
    const message = text.replace(/[^\x20-\x7E\r\n]+/g, "");
    const logFormat = "AUDIT_LOG: message";
    return logFormat.replace("message", message);
}

export default class AuditLogger {
    projectId: string;
    logger: LoggingClient | null;
    logName: string;

    constructor(projectId: string) {
        this.projectId = projectId;
        this.logger = null;
        this.logName = `projects/${this.projectId}/logs/stdout`;
    }

    private async getLoggerClient(): Promise<LoggingClient> {
        if (this.logger != null) {
            return this.logger;
        }

        const { Logging } = await import("@google-cloud/logging");
        this.logger = new Logging({ projectId: this.projectId });
        return this.logger;
    }

    info(logger: IncomingMessage["log"], message: string): void {
        const log = formatLogMessage(message);
        logger.info(log);
    }

    error(logger: IncomingMessage["log"], message: string): void {
        // Sanitize message: truncate length and remove non-printable characters to prevent log injection
        const sanitized = String(message).substring(0, 1000).replace(/[^\x20-\x7E\r\n]+/g, "");
        const log = formatLogMessage(sanitized);
        logger.error(log);
    }

    async getLogs(): Promise<AuditLog[]> {
        const auditLogs: AuditLog[] = [];
        const log = (await this.getLoggerClient()).log(this.logName);
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
