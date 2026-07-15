import { type AuditLog } from "../../types/auditLog.types";

import { fetchJsonList, type FetchJsonListResponse } from "./fetchJson";

type GetAuditLogsResponse = FetchJsonListResponse<AuditLog>;

async function getAuditLogs(): Promise<GetAuditLogsResponse> {
  return fetchJsonList<AuditLog>("GET", "/api/audit");
}

export { getAuditLogs };
