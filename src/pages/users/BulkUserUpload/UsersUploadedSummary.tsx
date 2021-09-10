import React, {ReactElement, useEffect, useState} from "react";
import {ONSButton, ONSPanel} from "blaise-design-system-react-components";
import {UploadedUser} from "../../../../Interfaces";
import {ErrorBoundary} from "../../../Components/ErrorHandling/ErrorBoundary";
import {useHistory} from "react-router-dom";
import converter from "number-to-words";


interface Props {
    usersUploaded: UploadedUser[]
    numberOfValidUsers: number
}

function UsersUploadedSummary({usersUploaded, numberOfValidUsers}: Props): ReactElement {
    const [listError, setListError] = useState<string>("Loading ...");
    const [numberOfCreatedUsers, setNumberOfCreatedUsers] = useState<number>(0);
    const history = useHistory();

    useEffect(() => {
        let createdUsers = 0;
        usersUploaded.map((user: UploadedUser) => {
            if (user.created) {
                createdUsers = createdUsers + 1;
            }
        });
        setNumberOfCreatedUsers(createdUsers);
    }, [usersUploaded]);

    function failedToUploadUserTable() {
        return <>
            <h2 className="u-mt-xl">Users that were not created</h2>
            <ErrorBoundary errorMessageText={"Failed to load audit logs."}>
                {
                    usersUploaded && usersUploaded.length > 0
                        ?
                        <table id="batch-table" className="table">
                            <thead className="table__head u-mt-m">
                            <tr className="table__row">
                                <th scope="col" className="table__header ">
                                    <span>Username</span>
                                </th>
                                <th scope="col" className="table__header ">
                                    <span>Upload status</span>
                                </th>
                            </tr>
                            </thead>
                            <tbody className="table__body">
                            {
                                usersUploaded.map(({name, created}: UploadedUser, index: number) => {
                                    if (!created) {
                                        return (
                                            <tr className="table__row" key={name + index}
                                                data-testid={"batch-table-row"}>

                                                <td className="table__cell ">
                                                    {name}
                                                </td>
                                                <td className="table__cell ">
                                                    <span
                                                        className={`status status--${(created ? "success" : "error")}`}>
                                                        {
                                                            created
                                                                ? "User created"
                                                                : "User not created"
                                                        }
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    }
                                })
                            }
                            </tbody>
                        </table>
                        :
                        <ONSPanel>{listError}</ONSPanel>
                }
            </ErrorBoundary>
        </>;
    }

    return (
        <>
            <h1 className="u-mt-l">Uploaded <em>{converter.toWords(numberOfCreatedUsers)} of {converter.toWords(numberOfValidUsers)}</em> user{(numberOfValidUsers > 1 && "s")} successfully
            </h1>

            {
                (
                    numberOfCreatedUsers !== numberOfValidUsers ?
                        <ONSPanel status={"error"}>
                            <p>
                                Not all users were created successfully, you can review which users were not created
                                successfully below.
                            </p>
                        </ONSPanel>
                        :
                        <ONSPanel>
                            <p>
                                Users will appear in the table on the homepage and should be accessible in Blaise
                            </p>
                        </ONSPanel>
                )
            }

            <br/>
            <ONSButton label={"Return to homepage"} primary={true} onClick={() => history.push("/")}/>
            {
                (
                    numberOfCreatedUsers !== numberOfValidUsers && failedToUploadUserTable()
                )
            }
        </>
    );
}

export default UsersUploadedSummary;
