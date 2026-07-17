import { Button, Panel } from "blaise-design-system-react-components";
import { type ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  validUsers: number;
  uploadUsers: () => void;
}

function Confirmation({ validUsers, uploadUsers }: Props): ReactElement {
  const [formError, setFormError] = useState<string>("");
  const [confirm, setConfirm] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();

  async function confirmOption() {
    if (confirm === null) {
      setFormError("Select an answer");

      return;
    }

    if (!confirm) {
      navigate("/users");

      return;
    }

    setLoading(true);
    setMessage("");

    uploadUsers();
  }

  return (
    <>
      {message !== "" && (
        <Panel status={message.includes("success") ? "success" : "error"}>
          <p>{message}</p>
        </Panel>
      )}

      <form className="ons-u-mt-s">
        {formError === "" ? (
          confirmUploadRadios(validUsers, setConfirm)
        ) : (
          <Panel status={"error"}>
            <strong>{formError}</strong>
            {confirmUploadRadios(validUsers, setConfirm)}
          </Panel>
        )}

        <br />
        <Button
          label={"Continue"}
          primary={true}
          loading={loading}
          id="confirm-continue"
          onClick={() => confirmOption()}
        />
        {!loading && (
          <Button
            label={"Cancel"}
            primary={false}
            id="cancel-overwrite"
            onClick={() => navigate("/users")}
          />
        )}
      </form>
    </>
  );
}

function confirmUploadRadios(
  validUsers: number,
  setConfirm: (value: ((prevState: boolean | null) => boolean | null) | boolean | null) => void,
) {
  return (
    <fieldset className="ons-fieldset">
      <legend className="ons-fieldset__legend"></legend>
      <div className="ons-radios__items">
        <p className="ons-radios__item">
          <span className="ons-radio">
            <input
              type="radio"
              id="confirm-upload"
              className="ons-radio__input ons-js-radio "
              value="True"
              name="confirm-upload"
              aria-label="Yes"
              onChange={() => setConfirm(true)}
            />
            <label
              className="ons-radio__label "
              htmlFor="confirm-upload"
            >
              Yes, upload {validUsers} user{validUsers > 1 && "s"}
            </label>
          </span>
        </p>
        <br />
        <p className="ons-radios__item">
          <span className="ons-radio">
            <input
              type="radio"
              id="cancel-upload"
              className="ons-radio__input ons-js-radio "
              value="False"
              name="confirm-upload"
              aria-label="No"
              onChange={() => setConfirm(false)}
            />
            <label
              className="ons-radio__label "
              htmlFor="cancel-upload"
            >
              No, cancel
            </label>
          </span>
        </p>
      </div>
    </fieldset>
  );
}

export default Confirmation;
