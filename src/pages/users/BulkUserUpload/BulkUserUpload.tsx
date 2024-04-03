import React, { ReactElement, useState } from "react";
import { ImportUser, UploadedUser } from "../../../../interfaces";
import { NewUser } from "blaise-api-node-client";
import UsersToUploadSummary from "./UsersToUploadSummary";
import SelectFile from "./SelectFile";
import { addNewUser } from "../../../utilities/http";
import UsersUploadedSummary from "./UsersUploadedSummary";
import Breadcrumbs from "../../../Components/Breadcrumbs";
import UsersUploadInProgress from "./UsersUploadInProgress";

function BulkUserUpload(): ReactElement {

    const [usersToUpload, setUsersToUpload] = useState<ImportUser[]>([]);
    const [numberOfValidUsers, setNumberOfValidUsers] = useState<number>(0);
    const [usersUploaded, setUsersUploaded] = useState<UploadedUser[]>([]);

    document.body.className = "ons-js-enabled";

    const Pages = {
        Upload: "Upload",
        ToUploadSummary: "Summary",
        InProgress: "InProgress",
        UploadedSummary: "UploadedSummary"
    };

    function MovePageToSummary() {
        setCurrentPage(Pages.ToUploadSummary);
    }

    async function UploadUsers() {
        setCurrentPage(Pages.InProgress);

        const uploadedUsersList: UploadedUser[] = [];
        let numberToUpload = 0;

        for (const user of usersToUpload) {
            if (!user.valid) {
                continue;
            }
            numberToUpload = numberToUpload + 1;

            const newUser: NewUser = {
                defaultServerPark: "",
                serverParks: [],
                name: user.name,
                password: user.password,
                role: user.role
            };
            const created = await addNewUser(newUser);

            uploadedUsersList.push({ name: user.name, created: created });
        }

        setUsersUploaded(usersUploaded.concat(uploadedUsersList));
        setNumberOfValidUsers(numberToUpload);
        setCurrentPage(Pages.UploadedSummary);
    }

    const [currentPage, setCurrentPage] = useState<string>(Pages.Upload);

    function returnPage(): ReactElement {
        switch (currentPage) {
            case Pages.Upload:
                return <SelectFile setUsersToUpload={setUsersToUpload} movePageForward={MovePageToSummary} />;
            case Pages.ToUploadSummary:
                return <UsersToUploadSummary usersToImport={usersToUpload} uploadUsers={UploadUsers} />;
            case Pages.InProgress:
                return <UsersUploadInProgress />;
            case Pages.UploadedSummary:
                return <UsersUploadedSummary key={usersUploaded.toString()} usersUploaded={usersUploaded}
                    numberOfValidUsers={numberOfValidUsers} />;
            default:
                return <SelectFile setUsersToUpload={setUsersToUpload} movePageForward={MovePageToSummary} />;
        }
    }

    return (
        <>
            <Breadcrumbs BreadcrumbList={
                [
                    { link: "/", title: "Home" }, { link: "/users", title: "Manage users" }
                ]
            } />

            <main id="main-content" className="ons-page__main ons-u-mt-no">
                {returnPage()}
            </main>
        </>
    );
}

export default BulkUserUpload;
