import React, {ReactElement, useState} from "react";
import {useHistory} from "react-router-dom";
import {ONSButton, ONSPanel} from "blaise-design-system-react-components";
import converter from "number-to-words";

interface Props {
    validUsers: number
    uploadUsers: () => void
}

function Confirmation({validUsers, uploadUsers}: Props): ReactElement {
    const [formError, setFormError] = useState<string>("");
    const [confirm, setConfirm] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const history = useHistory();

    async function confirmOption() {
        if (confirm === null) {
            setFormError("Select an answer");
            return;
        }
        if (!confirm) {
            history.push("/users");
            return;
        }

        setLoading(true);
        setMessage("");

        uploadUsers();
    }

    return (
        <>
            {
                message !== "" &&
                <ONSPanel status={message.includes("success") ? "success" : "error"}>
                    <p>{message}</p>
                </ONSPanel>
            }

            <form className="u-mt-s">
                {
                    formError === "" ?
                        confirmDeleteRadios(validUsers, setConfirm)
                        :
                        <ONSPanel status={"error"}>
                            <p className="panel__error">
                                <strong>{formError}</strong>
                            </p>
                            {confirmDeleteRadios(validUsers, setConfirm)}
                        </ONSPanel>
                }

                <br/>
                <ONSButton
                    label={"Continue"}
                    primary={true}
                    loading={loading}
                    id="confirm-continue"
                    onClick={() => confirmOption()}/>
                {!loading &&
                <ONSButton
                    label={"Cancel"}
                    primary={false}
                    id="cancel-overwrite"
                    onClick={() => history.push("/users")}/>
                }
            </form>
        </>
    );
}

function confirmDeleteRadios(validUsers: number, setConfirm: (value: (((prevState: (boolean | null)) => (boolean | null)) | boolean | null)) => void) {
    return (
        <fieldset className="fieldset">
            <legend className="fieldset__legend">
            </legend>
            <div className="radios__items">

                <p className="radios__item">
                        <span className="radio">
                        <input
                            type="radio"
                            id="confirm-upload"
                            className="radio__input js-radio "
                            value="True"
                            name="confirm-upload"
                            aria-label="Yes"
                            onChange={() => setConfirm(true)}
                        />
                        <label className="radio__label " htmlFor="confirm-upload">
                            Yes, upload {converter.toWords(validUsers)} valid user{(validUsers > 1 && "s")}
                        </label>
                    </span></p>
                <br/>
                <p className="radios__item">
                        <span className="radio">
                        <input
                            type="radio"
                            id="cancel-upload"
                            className="radio__input js-radio "
                            value="False"
                            name="confirm-upload"
                            aria-label="No"
                            onChange={() => setConfirm(false)}
                        />
                        <label className="radio__label " htmlFor="cancel-upload">
                            No, do not upload any users
                        </label>
                    </span>
                </p>
            </div>
        </fieldset>
    );
}

export default Confirmation;
