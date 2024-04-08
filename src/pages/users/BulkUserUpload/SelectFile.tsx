import React, { ReactElement, useState } from "react";
import { Collapsible, ONSButton } from "blaise-design-system-react-components";
import CSVReader from "react-csv-reader";
import { ImportUser } from "../../../interfaces";
import { SelectFileProps } from "../../../interfaces/usersPage";

function SelectFile({ setUsersToUpload, movePageForward }: SelectFileProps): ReactElement {

    const [buttonLoading, setButtonLoading] = useState<boolean>(false);
    const [uploadData, setUploadData] = useState<ImportUser[]>([]);

    function uploadUsers() {
        setButtonLoading(true);
        setUsersToUpload(uploadData);
        setButtonLoading(false);

        movePageForward();
    }

    const papaparseOptions = {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.toLowerCase().replace(/\W/g, "_")
    };

    return (
        <>
            <h1 className="ons-u-mb-l">Bulk user upload</h1>

            <label className="ons-label" htmlFor="react-csv-reader-input">Select CSV file
                <br />
                <span className="ons-label__description">File type accepted is .csv only</span>
            </label>
            <CSVReader
                cssInputClass="ons-input ons-input--text ons-input-type__input ons-input--upload"
                parserOptions={papaparseOptions}
                onFileLoaded={(data) => setUploadData(data)}
            />

            <br />
            <ONSButton label={"Upload"} primary={true} onClick={() => uploadUsers()} loading={buttonLoading} />

            <Collapsible title="What format should the bulk upload file be?">
                <>
                    <p>The user file should be a Comma-Separated Values file (CSV) with the headings <em>user, password
                        and role</em>.
                        A blank template is available to download below.
                    </p>

                    <div className="ons-download">

                        <div className="ons-download__content">
                            <h3 className="ons-u-fs-m ons-u-mt-no ons-u-mb-xs">
                                <a href={process.env.PUBLIC_URL + "/users.csv"} download="users.csv" type="text/csv">
                                    Bulk user upload template file<span className="ons-u-vh">,
                                        CSV document download, 48 Bytes
                                    </span></a>
                            </h3>
                            <span className="ons-u-fs-s ons-u-mb-xs ons-download__meta"
                                aria-hidden="true">Poster, CSV, 48 Bytes</span>
                            <p className="ons-download__excerpt">Blank CSV file to upload multiple users at once.</p>
                        </div>
                    </div>
                </>
            </Collapsible>
        </>
    );
}

export default SelectFile;
