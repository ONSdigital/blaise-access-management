import React, {ReactElement, useState} from "react";
import {Link, Redirect, useParams} from "react-router-dom";
import {ONSButton, ONSPanel} from "blaise-design-system-react-components";


interface ReturnPanel {
    visible: boolean
    message: string
    status: string
}

interface Parmas {
    user: string
}


function DeleteUser() : ReactElement {
    const [buttonLoading, setButtonLoading] = useState<boolean>(false);
    const [confirm, setConfirm] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [redirect, setRedirect] = useState<boolean>(false);
    const [returnPanel, setReturnPanel] = useState<ReturnPanel>({visible: false, message: "", status: "info"});
    const {user}: Parmas = useParams();

    function deleteUser() {

        if (!confirm) {
            setRedirect(true);
            setReturnPanel({visible: true, message: "Action discarded", status: "info"});
            return;
        }

        setButtonLoading(true);
        fetch("/api/users", {
            "method": "delete",
            "headers": {
                "user": user,
            }
        }).then((r: Response) => {
            if (r.status === 204) {
                setButtonLoading(false);
                setMessage("");
                setReturnPanel({visible: true, message: "User " + user + " deleted", status: "success"});
                setRedirect(true);
            } else {
                console.error("Failed to retrieve instrument list, status " + r.status);
                setMessage("Set password failed");
                setButtonLoading(false);
            }
        }).catch(() => {
                console.error("Failed to retrieve instrument list");
                setMessage("Set password failed");
                setButtonLoading(false);
            }
        );
    }

    return (
        <>
            {
                redirect && <Redirect to={{
                    pathname: "/users",
                    state: {updatedPanel: returnPanel}
                }}/>
            }
            <p className="cu"><Link to={"/users"}>Previous</Link></p>
            <h1>Are you sure you want to delete user <em className="highlight">{user}</em>?</h1>

            <ONSPanel hidden={(message === "")} status="error">
                {message}
            </ONSPanel>

            <form onSubmit={() => deleteUser()}>
                <fieldset className="fieldset">
                    <legend className="fieldset__legend">
                    </legend>
                    <div className="radios__items">
                        <p className="radios__item">
                        <span className="radio">
                        <input
                            type="radio"
                            id="yes-delete-item"
                            className="radio__input js-radio "
                            value="True"
                            name="confirm-delete"
                            aria-label="Yes"
                            onChange={() => setConfirm(true)}
                        />
                        <label className="radio__label " htmlFor="yes-delete-item">
                            Yes, delete {user}
                        </label>
                    </span>
                        </p>
                        <br/>
                        <p className="radios__item">
                        <span className="radio">
                        <input
                            type="radio"
                            id="no-delete-item"
                            className="radio__input js-radio "
                            value="False"
                            name="confirm-delete"
                            aria-label="No"
                            onChange={() => setConfirm(false)}
                        />
                        <label className="radio__label " htmlFor="no-delete-item">
                            No, do not delete {user}
                        </label>
                    </span></p>
                    </div>
                </fieldset>

                <br/>
                <ONSButton
                    label={"Save"}
                    primary={true}
                    loading={buttonLoading}
                    onClick={() => deleteUser()}/>
            </form>
        </>
    );
}

export default DeleteUser;
