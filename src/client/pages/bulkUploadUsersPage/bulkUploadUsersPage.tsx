import { type ReactElement, useCallback, useState } from "react";

import { addNewUser } from "../../api/http";
import { type ImportUser, type UploadedUser } from "../../types/userImport.types";
import { clientLogger } from "../../utils/logger";

import SelectFile from "./sections/selectFile";
import UsersToUploadSummary from "./sections/usersToUploadSummary";
import UsersUploadedSummary from "./sections/usersUploadedSummary";
import UsersUploadInProgress from "./sections/usersUploadInProgress";

import type { NewUser } from "blaise-api-node-client";

const Pages = {
  Upload: "Upload",
  ToUploadSummary: "Summary",
  InProgress: "InProgress",
  UploadedSummary: "UploadedSummary",
};

function BulkUserUpload(): ReactElement {
  const [usersToUpload, setUsersToUpload] = useState<ImportUser[]>([]);
  const [numberOfValidUsers, setNumberOfValidUsers] = useState<number>(0);
  const [usersUploaded, setUsersUploaded] = useState<UploadedUser[]>([]);
  const [currentPage, setCurrentPage] = useState<string>(Pages.Upload);

  document.body.className = "ons-js-enabled";

  const movePageToSummary = useCallback(() => {
    setCurrentPage(Pages.ToUploadSummary);
  }, []);

  const uploadUsers = useCallback(async () => {
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
        role: user.role,
      };
      const created = await addNewUser(newUser);

      uploadedUsersList.push({ name: user.name, created: created });
    }

    const createdUsersCount = uploadedUsersList.filter((user) => user.created).length;

    if (numberToUpload > 0) {
      clientLogger.info(
        "bulk uploaded users",
        `attempted=${numberToUpload}`,
        `created=${createdUsersCount}`,
      );
    }

    setUsersUploaded((currentUsersUploaded) => currentUsersUploaded.concat(uploadedUsersList));
    setNumberOfValidUsers(numberToUpload);
    setCurrentPage(Pages.UploadedSummary);
  }, [usersToUpload]);

  function returnPage(): ReactElement {
    switch (currentPage) {
      case Pages.Upload:
        return (
          <SelectFile
            setUsersToUpload={setUsersToUpload}
            movePageForward={movePageToSummary}
          />
        );
      case Pages.ToUploadSummary:
        return (
          <UsersToUploadSummary
            usersToImport={usersToUpload}
            uploadUsers={uploadUsers}
          />
        );
      case Pages.InProgress:
        return <UsersUploadInProgress />;
      case Pages.UploadedSummary:
        return (
          <UsersUploadedSummary
            key={usersUploaded.toString()}
            usersUploaded={usersUploaded}
            numberOfValidUsers={numberOfValidUsers}
          />
        );
      default:
        return (
          <SelectFile
            setUsersToUpload={setUsersToUpload}
            movePageForward={movePageToSummary}
          />
        );
    }
  }

  return (
    <>
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-m"
      >
        {returnPage()}
      </main>
    </>
  );
}

export default BulkUserUpload;
