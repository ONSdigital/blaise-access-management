import React, { ReactElement, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { ONSButton, ONSPanel, ONSPasswordInput } from "blaise-design-system-react-components";
import { BreadcrumbItem } from "../../../Interfaces";
import { AuthManager } from "blaise-login-react/blaise-login-react-client";
import { UserRouteParams } from "../../../Interfaces/usersPage";
import Breadcrumbs from "../../Components/Breadcrumbs";

function ChangePassword(): ReactElement {
    const { user }: UserRouteParams = useParams() as unknown as UserRouteParams;
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
        });
    }

    const breadcrumbList: BreadcrumbItem[] = [
        { link: "/", title: "Home" },
        { link: "/users", title: "Manage users" }
    ];

    return (
        <>
            {
                redirect && <Navigate
                    to={{ pathname: "/users" }}
                    state={{
                        updatedPanel: {
                            visible: true,
                            message: "Password for user " + user + " changed",
                            status: "success"
                        }
                    }}
                />
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
