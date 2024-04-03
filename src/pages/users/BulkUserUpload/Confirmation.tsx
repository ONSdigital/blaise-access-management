import React, { ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ONSButton, ONSPanel } from "blaise-design-system-react-components";
import converter from "number-to-words";

interface Props {
    validUsers: number
    uploadUsers: () => void
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
            {
                message !== "" &&
                <ONSPanel status={message.includes("success") ? "success" : "error"}>
                    <p>{message}</p>
                </ONSPanel>
            }

            <form className="ons-u-mt-s">
                {
                    formError === "" ?
                        confirmDeleteRadios(validUsers, setConfirm)
                        :
                        <ONSPanel status={"error"}>
                            <p className="ons-panel__error">
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
                    onClick={() => navigate("/users")}/>
                }
            </form>
        </>
    );
}

function confirmDeleteRadios(validUsers: number, setConfirm: (value: (((prevState: (boolean | null)) => (boolean | null)) | boolean | null)) => void) {
    return (
        <fieldset className="ons-fieldset">
            <legend className="ons-fieldset__legend">
            </legend>
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
                        <label className="ons-radio__label " htmlFor="confirm-upload">
                            Yes, upload {converter.toWords(validUsers)} valid user{(validUsers > 1 && "s")}
                        </label>
                    </span></p>
                <br/>
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
                        <label className="ons-radio__label " htmlFor="cancel-upload">
                            No, do not upload any users
                        </label>
                    </span>
                </p>
            </div>
        </fieldset>
    );
}

export default Confirmation;
