import {
  Button,
  ErrorBoundary,
  LoadingPanel,
  Panel,
  Table,
} from "blaise-design-system-react-components";
import { type ReactElement, useEffect, useState } from "react";

import { getAuditLogs } from "../../api/http";
import { type AuditLog } from "../../utils/auditLog.types";

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function AuditPage(): ReactElement {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listError, setListError] = useState<string>("");

  async function loadAuditLogs() {
    setIsLoading(true);
    setListError("");

    const [success, logs] = await getAuditLogs();

    setAuditLogs(logs);
    setIsLoading(false);

    if (!success) {
      setListError("Unable to load access history.");

      return;
    }

    if (logs.length === 0) {
      setListError("No recent access history found.");
    }
  }

  useEffect(() => {
    void loadAuditLogs();
  }, []);

  return (
    <>
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-m"
      >
        <h1 className="ons-u-mb-l">Access history</h1>
        <Button
          onClick={() => {
            void loadAuditLogs();
          }}
          label="Reload"
          primary={true}
          small={true}
        />

        {isLoading && <LoadingPanel />}

        {!isLoading && listError !== "" && (
          <Panel
            status={listError.includes("Unable") ? "error" : "info"}
            spacious={true}
          >
            {listError}
          </Panel>
        )}

        {!isLoading && listError === "" && (
          <ErrorBoundary errorMessageText={"Failed to get access history"}>
            <Table
              columns={["Date and time", "Information"]}
              id={"audit-table"}
              scrollableLabel={"Access history"}
            >
              {auditLogs.map(({ id, timestamp, severity, message }: AuditLog) => (
                <tr
                  className="ons-table__row"
                  key={id}
                  data-testid={"audit-table-row"}
                >
                  <td
                    className="ons-table__cell"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {formatTimestamp(timestamp)}
                  </td>
                  <td className="ons-table__cell">
                    <span className={`ons-status ons-status--${severity.toLowerCase()}`}>
                      {message}
                    </span>
                  </td>
                </tr>
              ))}
            </Table>
          </ErrorBoundary>
        )}
      </main>
    </>
  );
}

export default AuditPage;
