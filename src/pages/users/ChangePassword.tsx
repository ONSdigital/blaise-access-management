import React, {ReactElement, useState} from "react";
import {Link, Redirect, useParams} from "react-router-dom";
import {ONSButton, ONSPanel, ONSPasswordInput} from "blaise-design-system-react-components";

interface Parmas {
    user: string
}


function ChangePassword(): ReactElement  {
    // We can use the `useParams` hook here to access
    // the dynamic pieces of the URL.
    const {user}: Parmas = useParams();
    const [buttonLoading, setButtonLoading] = useState<boolean>(false);
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [redirect, setRedirect] = useState<boolean>(false);

    function changePassword() {
        if (password === "") {
            setMessage("Passwords cannot be blank");
            return;
        }
        if (password !== confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }

        setButtonLoading(true);
        fetch("/api/change_password/" + user, {
            "headers": {
                "password": password,
            }
        })
            .then((r: Response) => {
                if (r.status === 204) {
                    setButtonLoading(false);
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
                    state: {updatedPanel: {visible: true, message: "Password for user " + user + " changed", status: "success"} }
                }}/>
            }
            <p>
                <Link to={"/users"}>Previous</Link>
            </p>
            <h1>Change password for user <em>{user}</em></h1>
            <ONSPanel hidden={(message === "")} status="error">
                {message}
            </ONSPanel>
            <form onSubmit={() => changePassword()}>
                <ONSPasswordInput label={"New password"}
                                  autoFocus={true}
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}/>
                <ONSPasswordInput label={"Confirm password"}
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}/>
                <ONSButton
                    label={"Save"}
                    primary={true}
                    loading={buttonLoading}
                    onClick={() => changePassword()}/>
            </form>


        </>
    );
}

export default ChangePassword;
