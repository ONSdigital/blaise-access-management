import { type IncomingMessage } from "http";

import { type Logging } from "@google-cloud/logging";

import type { AuditLog } from "../types/logger.types.js";

type LoggingClient = Logging;
const AUDIT_LOG_LOOKBACK_DAYS = 7;
const APP_ENGINE_RESOURCE_TYPE = "gae_app";
const APP_ENGINE_SERVICE_ID = "bam-ui";
const AUDIT_LOG_MESSAGE_PREFIX = "AUDIT_LOG:";
const AUDIT_LOG_PAYLOAD_FIELD = "auditMessage";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readStringField(payload: unknown, key: string): string | undefined {
  if (!isRecord(payload)) {
    return undefined;
  }

  const value = payload[key];

  return typeof value === "string" ? value : undefined;
}

function sanitiseLogText(value: unknown): string {
  return String(value)
    .replace(/[\r\n]+/g, " ")
    .replace(/[^\x20-\x7E]+/g, "")
    .trim();
}

function stripAuditPrefix(message: string): string {
  return message.replace(/^AUDIT_LOG:\s*/, "");
}

function buildAuditLogFilter(referenceDate: Date): string {
  const earliestTimestamp = new Date(
    referenceDate.getTime() - AUDIT_LOG_LOOKBACK_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  return (
    `resource.type="${APP_ENGINE_RESOURCE_TYPE}" AND ` +
    `resource.labels.module_id="${APP_ENGINE_SERVICE_ID}" AND ` +
    `severity="INFO" AND ` +
    `timestamp >= "${earliestTimestamp}" AND (` +
    `jsonPayload.message:"${AUDIT_LOG_MESSAGE_PREFIX}" OR ` +
    `jsonPayload.msg:"${AUDIT_LOG_MESSAGE_PREFIX}" OR ` +
    `jsonPayload.info.message:"${AUDIT_LOG_MESSAGE_PREFIX}" OR ` +
    `jsonPayload.info.msg:"${AUDIT_LOG_MESSAGE_PREFIX}" OR ` +
    `jsonPayload.${AUDIT_LOG_PAYLOAD_FIELD}:* OR ` +
    `jsonPayload.info.${AUDIT_LOG_PAYLOAD_FIELD}:*` +
    `)`
  );
}

export function formatLogMessage(text: string, severity: "info" | "error"): string {
  const sanitisedText = sanitiseLogText(text);
  const message = severity === "error" ? sanitisedText.substring(0, 1000) : sanitisedText;

  return `${AUDIT_LOG_MESSAGE_PREFIX} ${message}`;
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
    const auditMessage = sanitiseLogText(message);

    logger.info({ [AUDIT_LOG_PAYLOAD_FIELD]: auditMessage }, AUDIT_LOG_MESSAGE_PREFIX);
  }

  error(logger: IncomingMessage["log"], message: string): void {
    const auditMessage = sanitiseLogText(message);

    logger.error({ [AUDIT_LOG_PAYLOAD_FIELD]: auditMessage }, AUDIT_LOG_MESSAGE_PREFIX);
  }

  async getLogs(): Promise<AuditLog[]> {
    const auditLogs: AuditLog[] = [];
    const log = (await this.getLoggerClient()).log(this.logName);
    const filter = buildAuditLogFilter(new Date());
    const [entries] = await log.getEntries({
      filter,
      maxResults: 50,
    });

    for (const entry of entries) {
      let id = "";
      let timestamp = "";
      let severity = "INFO";
      let message = "";

      if (entry.metadata.insertId != null) {
        id = entry.metadata.insertId;
      }

      if (entry.metadata.timestamp != null) {
        timestamp = entry.metadata.timestamp.toString();
      }

      if (entry.metadata.severity != null) {
        severity = entry.metadata.severity.toString();
      }

      const nestedPayload = isRecord(entry.data) ? entry.data.info : undefined;
      const auditMessage =
        readStringField(entry.data, AUDIT_LOG_PAYLOAD_FIELD) ??
        readStringField(nestedPayload, AUDIT_LOG_PAYLOAD_FIELD);
      const rawMessage =
        readStringField(entry.data, "message") ??
        readStringField(entry.data, "msg") ??
        readStringField(nestedPayload, "message") ??
        readStringField(nestedPayload, "msg");

      if (auditMessage) {
        message = auditMessage;
      } else if (rawMessage) {
        message = stripAuditPrefix(rawMessage);
      }

      auditLogs.push({
        id: id,
        timestamp: timestamp,
        message: message,
        severity: severity,
      });
    }

    return auditLogs;
  }
}
