import { type AuditLog } from "../../utils/auditLog.types";

import { fetchJsonList } from "./fetchJson";

type GetAuditLogsResponse = [boolean, AuditLog[]];

async function getAuditLogs(): Promise<GetAuditLogsResponse> {
  try {
    const [success, data] = await fetchJsonList<AuditLog>("GET", "/api/audit");

    return [success, data] as GetAuditLogsResponse;
  } catch {
    return [false, []] as GetAuditLogsResponse;
  }
}

export { getAuditLogs };
