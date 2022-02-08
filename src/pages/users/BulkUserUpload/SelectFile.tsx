import React, { ReactElement, useEffect, useState } from "react";
import { Collapsible, ONSButton } from "blaise-design-system-react-components";
import CSVReader from "react-csv-reader";
import { ImportUser } from "../../../../Interfaces";
import { UserRole } from "blaise-api-node-client";
import { getAllRoles } from "../../../utilities/http";

interface Props {
    setUsersToUpload: (users: ImportUser[]) => void;
    movePageForward: () => void;
}

function SelectFile({ setUsersToUpload, movePageForward }: Props): ReactElement {

    const [buttonLoading, setButtonLoading] = useState<boolean>(false);
    const [uploadData, setUploadData] = useState<ImportUser[]>([]);
    const [panelOpen, setPanelOpen] = useState<boolean>(false);
    const [roles, setRoles] = useState<UserRole[]>([]);

    useEffect(() => {
        getRolesList().then(() => console.log("Call getRolesList Complete"));
    }, []);

    async function getRolesList() {
        setRoles([]);

        const [success, roleList] = await getAllRoles();
        if (!success) {
            return;
        }
        setRoles(roleList);
    }

    function validateUser(user: ImportUser) {
        console.log(user);
        user.valid = true;
        user.warnings = [];


        if (user.name === undefined || user.name === null) {
            console.warn("user with invalid data!");
            user.valid = false;
            user.warnings.push("Invalid name");
        }

        if (user.password === undefined || user.password === null) {
            console.warn("user with invalid data!");
            user.valid = false;
            user.warnings.push("Invalid password");
        }

        if (user.role === undefined || user.role === null) {
            console.warn("user with invalid data!");
            user.warnings.push("Invalid role");
            user.valid = false;
        } else {
            const isValidRole = roles.some(function (el) {
                return el.name === user.role;
            });

            if (!isValidRole) {
                console.warn("User with invalid role!");
                user.warnings.push("Not a valid role");
                user.valid = false;
            }
        }
    }


    function validateUpload() {
        console.log("validateUpload()");
        setButtonLoading(true);


        uploadData.map((row) => {
            validateUser(row);
        });

        console.log(uploadData);

        setButtonLoading(false);

        setUsersToUpload(uploadData);
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
            <h1 className="u-mb-l">Bulk user upload</h1>

            <label className="label" htmlFor="react-csv-reader-input">Select CSV file
                <br />
                <span className="label__description">File type accepted is .csv only</span>
            </label>
            <CSVReader
                cssInputClass="input input--text input-type__input input--upload"
                parserOptions={papaparseOptions}
                onFileLoaded={(data) => setUploadData(data)}
            />

            <br />
            <ONSButton label={"Upload"} primary={true} onClick={() => validateUpload()} loading={buttonLoading} />

            <Collapsible title="What format should the bulk upload file be?">
                <>
                    <p>The user file should be a Comma-Separated Values file (CSV) with the headings <em>user, password
                        and role</em>.
                        A blank template is available to download below.
                    </p>

                    <div className="download">
                        <div className="download__image" aria-hidden="true">
                            <a className="download__image-link"
                                href="/documents/users.csv">
                                <img src="https://ons-design-system.netlify.app/img/small/placeholder-portrait.png"
                                    alt=""
                                    loading="lazy" />
                            </a>
                        </div>
                        <div className="download__content">
                            <h3 className="u-fs-m u-mt-no u-mb-xs">
                                <a href="/documents/users.csv">
                                    Bulk user upload template file<span className="u-vh">,
                                        CSV document download, 48 Bytes
                                    </span></a>
                            </h3>
                            <span className="u-fs-s u-mb-xs download__meta"
                                aria-hidden="true">Poster, CSV, 48 Bytes</span>
                            <p className="download__excerpt">Blank CSV file to upload multiple users at once.</p>
                        </div>
                    </div>
                </>
            </Collapsible>
        </>
    );
}

export default SelectFile;
