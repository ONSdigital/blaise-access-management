import { ONSLoadingPanel } from "blaise-design-system-react-components";
import React from "react";

const UsersUploadInProgress = () => {
    return (
        <>
            <h1 className="u-mb-l">Upload in progress</h1>
            <ONSLoadingPanel/>
        </>
    );
};

export default UsersUploadInProgress;
