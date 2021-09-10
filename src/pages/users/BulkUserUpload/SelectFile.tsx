import React, {ReactElement, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {ONSButton} from "blaise-design-system-react-components";
import CSVReader from "react-csv-reader";
import {ImportUser, Role} from "../../../../Interfaces";
import {getAllRoles} from "../../../utilities/http";

interface Props {
    setUsersToUpload: (users: ImportUser[]) => void
    movePageForward: () => void
}

function SelectFile({setUsersToUpload, movePageForward}: Props): ReactElement {

    const [buttonLoading, setButtonLoading] = useState<boolean>(false);
    const [uploadData, setUploadData] = useState<ImportUser[]>([]);
    const [panelOpen, setPanelOpen] = useState<boolean>(false);
    const [roles, setRoles] = useState<Role[]>([]);

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
            const isValidRole = roles.some(function(el){ return el.name === user.role;});

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
            <p className="u-mt-m">
                <Link to={"/users"}>Previous</Link>
            </p>
            <h1>Bulk user upload</h1>

            <label className="label" htmlFor="react-csv-reader-input">Select CSV file
                <br/>
                <span className="label__description">File type accepted is .csv only</span>
            </label>
            <CSVReader
                cssInputClass="input input--text input-type__input input--upload"
                parserOptions={papaparseOptions}
                onFileLoaded={(data) => setUploadData(data)}
            />

            <br/>
            <ONSButton label={"Upload"} primary={true} onClick={() => validateUpload()} loading={buttonLoading}/>

            <div id="collapsible-with-save"
                 className={`collapsible js-collapsible collapsible--initialised ${(panelOpen && "collapsible--open")} u-mt-l`}
                 data-btn-close="Hide this" data-save-state="true" role="group">
                <div className="collapsible__heading js-collapsible-heading" role="link"
                     onClick={() => setPanelOpen(!panelOpen)}
                     aria-controls="collapsible-with-save" aria-expanded="false"
                     data-ga-action="Close panel">
                    <div className="collapsible__controls">
                        <div className="collapsible__title">What format should the bulk upload file be?</div>
                        <span className="collapsible__icon">
                            <svg className="svg-icon" viewBox="0 0 7.5 12.85" xmlns="http://www.w3.org/2000/svg" focusable="false">
                                <path
                                    d="M5.74,14.28l-.57-.56a.5.5,0,0,1,0-.71h0l5-5-5-5a.5.5,0,0,1,0-.71h0l.57-.56a.5.5,0,0,1,.71,0h0l5.93,5.93a.5.5,0,0,1,0,.7L6.45,14.28a.5.5,0,0,1-.71,0Z"
                                    transform="translate(-5.02 -1.59)"/>
                            </svg>
                        </span>
                    </div>
                </div>
                <div id="collapsible-with-save-content" className="collapsible__content js-collapsible-content"
                     aria-hidden={(panelOpen ? "false" : "true")}>
                    <p>The user file should be a Comma-Separated Values file (CSV) with the headings <em>user, password and role</em>.
                        A blank template is available to download below.
                    </p>

                    <div className="download">
                        <div className="download__image" aria-hidden="true">
                            <a className="download__image-link"
                               href="/documents/users.csv">
                                <img src="https://ons-design-system.netlify.app/img/small/placeholder-portrait.png" alt=""
                                     loading="lazy"/>
                            </a>
                        </div>
                        <div className="download__content">
                            <h3 className="u-fs-m u-mt-no u-mb-xs">
                                <a href="/documents/users.csv">
                                    Bulk user upload template file<span className="u-vh">,
                                CSV document download, 48 Bytes
                        </span></a>
                            </h3>
                            <span className="u-fs-s u-mb-xs download__meta" aria-hidden="true">Poster, CSV, 48 Bytes</span>
                            <p className="download__excerpt">Blank CSV file to upload multiple users at once.</p>
                        </div>
                    </div>

                    <button type="button" className="btn btn--small js-collapsible-button btn--secondary u-mt-m"
                            aria-hidden="true" aria-controls="collapsible-with-save" data-ga-action="Close panel"
                            onClick={() => setPanelOpen(false)}>
                        <span className="btn__inner js-collapsible-button-inner">Hide this</span>
                        <span className="btn__context u-vh">What is a photovoltaic system? undefined</span>
                    </button>
                </div>
            </div>
        </>
    );
}

export default SelectFile;
