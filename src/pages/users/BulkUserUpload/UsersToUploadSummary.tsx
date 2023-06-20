import React, {ReactElement, useEffect, useState} from "react";
import {ErrorBoundary, ONSPanel} from "blaise-design-system-react-components";
import {ImportUser} from "../../../../Interfaces";
import Confirmation from "./Confirmation";
import converter from "number-to-words";
import pino from "pino";

const logger = pino();

interface Props {
    statusDescriptionList: ImportUser[]
    uploadUsers: () => void
}

function UsersToUploadSummary({statusDescriptionList, uploadUsers}: Props): ReactElement {
    const [userList, setUserList] = useState<ImportUser[]>([]);
    const [listError, setListError] = useState<string>("Loading ...");
    const [noValidUsers, setNoValidUsers] = useState<number>(0);

    useEffect(() => {
        setupUserList().then(() => logger.info("SetupUserList is complete"));
    }, [statusDescriptionList]);

    async function setupUserList() {
        setListError("Loading ...");

        let noValid = 0;
        statusDescriptionList.map((user: ImportUser) => {
            if (user.valid) {
                noValid = noValid + 1;
            }
        });

        setNoValidUsers(noValid);
        statusDescriptionList.sort((a, b) => (a.valid ? 1 : 0) - (b.valid ? 1 : 0));

        if (statusDescriptionList.length === 0) {
            setListError("No users found to upload");
        }

        await setUserList(statusDescriptionList);
    }

    return (
        <>
            <h1 className="ons-u-mb-l">Bulk upload <em>{converter.toWords(noValidUsers)}</em> user{(noValidUsers > 1 && "s")}?</h1>
            <ONSPanel>
                <p>{noValidUsers} of {userList.length} users are valid and will be uploaded. <em>Invalid users will not be uploaded.
                </em> You can review any issues in the table below.</p>
            </ONSPanel>

            <Confirmation validUsers={noValidUsers} uploadUsers={uploadUsers}/>
            <h2 className="ons-u-mt-xl">Users to upload</h2>
            <ErrorBoundary errorMessageText={"Failed to load audit logs."}>
                {
                    userList && userList.length > 0
                        ?
                        <table id="batch-table" className="ons-table">
                            <thead className="ons-table__head ons-u-mt-m">
                            <tr className="ons-table__row">
                                <th scope="col" className="ons-table__header ">
                                    <span>Username</span>
                                </th>
                                <th scope="col" className="ons-table__header ">
                                    <span>Role</span>
                                </th>
                                <th scope="col" className="ons-table__header ">
                                    <span>User validity</span>
                                </th>
                            </tr>
                            </thead>
                            <tbody className="ons-table__body">
                            {
                                userList.map(({name, role, valid, warnings}: ImportUser, index: number) => {

                                    return (
                                        <tr className="ons-table__row" key={name + index}
                                            data-testid={"batch-table-row"}>

                                            <td className="ons-table__cell ">
                                                {name}
                                            </td>
                                            <td className="ons-table__cell ">
                                                {role}
                                            </td>
                                            <td className="ons-table__cell ">
                                                <span className={`ons-status ons-status--${(valid ? "success" : "error")}`}>
                                                    {
                                                        valid
                                                            ? "Valid User"
                                                            : warnings.map((message) => {
                                                                return (`${message}. `);
                                                            })
                                                    }
                                                </span>
                                            </td>

                                        </tr>
                                    );
                                })
                            }
                            </tbody>
                        </table>
                        :
                        <ONSPanel>{listError}</ONSPanel>
                }
            </ErrorBoundary>
        </>
    );
}

export default UsersToUploadSummary;
