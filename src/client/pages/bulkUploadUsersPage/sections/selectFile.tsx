import { Button, Collapsible, Panel, Upload } from "blaise-design-system-react-components";
import { type ChangeEvent, type ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";

import { type ImportUser } from "../../../types/userImport.types";
import { type SelectFileProps } from "../../../types/users.types";

function SelectFile({ setUsersToUpload, movePageForward }: SelectFileProps): ReactElement {
  const navigate = useNavigate();
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [uploadData, setUploadData] = useState<ImportUser[]>([]);
  const [uploadError, setUploadError] = useState<string>("");
  const usersTemplateHref = `${import.meta.env.BASE_URL}users.csv`;

  function uploadUsers() {
    if (uploadData.length === 0) {
      setUploadError("Select a CSV file to upload");

      return;
    }

    setButtonLoading(true);
    setUsersToUpload(uploadData);
    setButtonLoading(false);

    movePageForward();
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    void readCsvFile(event.target.files?.[0]);
  };

  async function readCsvFile(file?: File) {
    if (!file) {
      setUploadData([]);
      setUploadError("");

      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setUploadData([]);
      setUploadError("Select a CSV file to upload");

      return;
    }

    const text = await file.text();

    setUploadData(parseCsv(text));
    setUploadError("");
  }

  return (
    <>
      <h1 className="ons-u-mb-l">Bulk upload users</h1>
      {uploadError && <Panel status="error">{uploadError}</Panel>}

      <div className="ons-grid ons-u-mt-m">
        <div className="ons-grid__col ons-col-8@m ons-col-6@l">
          <Upload
            id="users-csv-upload"
            label="Select users file"
            description="Accepted file type: csv"
            accept=".csv"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="ons-u-mt-m ons-u-mb-m">
        <Button
          label={"Continue"}
          primary={true}
          onClick={() => uploadUsers()}
          loading={buttonLoading}
        />
        <Button
          label={"Cancel"}
          primary={false}
          onClick={() => navigate("/users")}
        />
      </div>

      <Collapsible title="What format should the bulk upload users file be?">
        <>
          <p>
            The file should be a Comma-Separated Values (CSV) file with the headings{" "}
            <em>user, password and role</em>. A blank template is available to download below.
          </p>

          <div className="ons-download">
            <div className="ons-download__content">
              <h3 className="ons-u-fs-m ons-u-mt-no ons-u-mb-xs">
                <a
                  href={usersTemplateHref}
                  download="users.csv"
                  type="text/csv"
                >
                  Bulk upload users template file
                </a>
              </h3>
              <p className="ons-download__excerpt">Template CSV file to bulk upload users.</p>
            </div>
          </div>
        </>
      </Collapsible>
    </>
  );
}

function parseCsv(text: string): ImportUser[] {
  const [headerLine, ...rows] = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!headerLine) {
    return [];
  }

  const headers = parseCsvRow(headerLine).map((header) => header.toLowerCase().replace(/\W/g, "_"));

  return rows.map((row) => {
    const values = parseCsvRow(row);
    const record = Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""]),
    );

    return {
      name: String(record.name ?? ""),
      password: String(record.password ?? ""),
      role: String(record.role ?? ""),
      valid: false,
      warnings: [],
    };
  });
}

function parseCsvRow(row: string): string[] {
  const values: string[] = [];
  let currentValue = "";
  let inQuotes = false;

  for (let index = 0; index < row.length; index += 1) {
    const character = row[index];

    if (character === '"') {
      if (inQuotes && row[index + 1] === '"') {
        currentValue += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (character === "," && !inQuotes) {
      values.push(currentValue.trim());
      currentValue = "";

      continue;
    }

    currentValue += character;
  }

  values.push(currentValue.trim());

  return values;
}

export default SelectFile;
