import React, {ReactElement, useState} from "react";
import {Redirect, useParams} from "react-router-dom";
import {ONSButton, ONSPanel, ONSPasswordInput} from "blaise-design-system-react-components";
import Breadcrumbs, {BreadcrumbItem} from "../../Components/Breadcrumbs";
import {AuthManager} from "blaise-login-react-client";

interface Parmas {
    user: string;
}

function ChangePassword(): ReactElement {
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
        const authManager = new AuthManager();
        fetch("/api/change_password/" + user, {
            "headers": Object.assign({}, {
                "password": password
            }, authManager.authHeader())
        })
            .then((r: Response) => {
                if (r.status === 204) {
                    setButtonLoading(false);
                    setRedirect(true);
                } else {
                    setMessage("Set password failed");
                    setButtonLoading(false);
                }
            }).catch(() => {
                setMessage("Set password failed");
                setButtonLoading(false);
            }
            );
    }

    const breadcrumbList: BreadcrumbItem[] = [
        {link: "/", title: "Home"},
        {link: "/users", title: "Manage users"}
    ];

    return (
        <>
            {
                redirect && <Redirect to={{
                    pathname: "/users",
                    state: {
                        updatedPanel: {
                            visible: true,
                            message: "Password for user " + user + " changed",
                            status: "success"
                        }
                    }
                }} />
            }
            <Breadcrumbs BreadcrumbList={breadcrumbList} />

            <main id="main-content" className="ons-page__main ons-u-mt-no">
                <h1 className="ons-u-mb-l">Change password for user <em>{user}</em></h1>
                <ONSPanel hidden={(message === "")} status="error">
                    {message}
                </ONSPanel>
                <form onSubmit={() => changePassword()}>
                    <ONSPasswordInput label={"New password"}
                        autoFocus={true}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} />
                    <ONSPasswordInput label={"Confirm password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)} />
                    <ONSButton
                        label={"Save"}
                        primary={true}
                        loading={buttonLoading}
                        onClick={() => changePassword()} />
                </form>
            </main>
        </>
    );
}

export default ChangePassword;
