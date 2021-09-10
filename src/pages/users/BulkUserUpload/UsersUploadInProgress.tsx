import { ONSLoadingPanel } from "blaise-design-system-react-components";
import React, {ReactElement} from "react";

const UsersUploadInProgress = (): ReactElement => {
    return (
        <>
            <h1 className="u-mb-l">Upload in progress</h1>
            <ONSLoadingPanel/>
        </>
    );
};

export default UsersUploadInProgress;
