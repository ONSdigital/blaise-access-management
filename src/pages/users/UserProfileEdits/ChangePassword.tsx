import React, { ReactElement, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { ONSButton, ONSPanel, ONSPasswordInput } from "blaise-design-system-react-components";
import { BreadcrumbItem } from "../../../Interfaces";
import { AuthManager } from "blaise-login-react/blaise-login-react-client";
import { UserRouteParams } from "../../../Interfaces/usersPage";
import Breadcrumbs from "../../../Components/Breadcrumbs";
import UserSignInErrorPanel from "../../../Components/UserSignInErrorPanel";

export default function ChangePassword(): ReactElement {
    const { user: viewedUsername }: UserRouteParams = useParams() as unknown as UserRouteParams;
    const { state } = useLocation();
    const { currentUser } = state || { currentUser: null, viewedUserDetails: null };
    const [buttonLoading, setButtonLoading] = useState<boolean>(false);
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [redirect, setRedirect] = useState<boolean>(false);

    const changePassword = () => {
        const sanitisedPassword = password.trim();
        const sanitisedConfirmPassword = confirmPassword.trim();

        if (sanitisedPassword === "" || sanitisedConfirmPassword === "") {
            setMessage("Passwords cannot be blank");
            return;
        }
        if (sanitisedPassword !== sanitisedConfirmPassword) {
            setMessage("Passwords do not match");
            return;
        }

        setButtonLoading(true);
        const authManager = new AuthManager();

        fetch("/api/change-password/" + viewedUsername,
            {
                "headers": Object.assign({}, {
                    "password": sanitisedPassword
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
    };

    const breadcrumbList: BreadcrumbItem[] = [
        { link: "/", title: "Home" },
        { link: "/users/", title: "Manage users" },
        { link: `/users/${viewedUsername}`, title: "View user", state: { currentUser } }
    ];

    if (!currentUser) {
        return (<UserSignInErrorPanel/>);
    }

    return (
        <>
            {
                redirect && <Navigate
                    to={{ pathname: `/users/${viewedUsername}` }}
                    state={{
                        currentUser,
                        updatedPanel: {
                            visible: true,
                            message: "Password changed for user called " + viewedUsername,
                            status: "success"
                        }
                    }}
                />
            }
            <Breadcrumbs BreadcrumbList={breadcrumbList} />

            <main id="main-content" className="ons-page__main ons-u-mt-no">
                <h1 className="ons-u-mb-l">Change password for user <em>{viewedUsername}</em></h1>
                <ONSPanel hidden={(message === "")} status="error">
                    {message}
                </ONSPanel>
                <form onSubmit={() => changePassword()}>
                    <ONSPasswordInput label={"New password"}
                        inputId={"new-password"}
                        autoFocus={true}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)} />
                    <ONSPasswordInput label={"Confirm password"}
                        inputId={"confirm-password"}
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