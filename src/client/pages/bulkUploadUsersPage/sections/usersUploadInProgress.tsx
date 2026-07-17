import { LoadingPanel } from "blaise-design-system-react-components";
import { type ReactElement } from "react";

const UsersUploadInProgress = (): ReactElement => {
  return (
    <>
      <h1 className="ons-u-mb-l">Upload in progress</h1>
      <LoadingPanel />
    </>
  );
};

export default UsersUploadInProgress;
