import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Breadcrumbs from "../../../Components/Breadcrumbs";
import AsyncContent from "../../../Components/AsyncContent";
import { useAsyncRequest } from "../../../hooks/useAsyncRequest";
import ProfileTable from "./ProfileTable";
import { getUser } from "../../../api/http";
import { ONSPanel } from "blaise-design-system-react-components";
import { GetUserResponse } from "../../../Interfaces/usersPage";
import UserSignInErrorPanel from "../../../Components/UserSignInErrorPanel";

export default function UserProfile() {
    const { user } = useParams();
    const { state } = useLocation();
    const { currentUser, updatedPanel } = state || { currentUser: null, updatedPanel: null };
    const userDetails = useAsyncRequest<GetUserResponse>(() => getUser(user as string));

    if (!currentUser) {
        return (<UserSignInErrorPanel/>);
    }

    return (
        <>
            <Breadcrumbs BreadcrumbList={
                [
                    { link: "/", title: "Home" },
                    { link: "/users", title: "Manage users" }
                ]
            } />
            {updatedPanel && updatedPanel.visible ? (
                <ONSPanel status={updatedPanel.status}>
                    <div className="ons-panel__body">{updatedPanel.message}</div>
                </ONSPanel>)
                : null }
            <AsyncContent content={userDetails}>
                {(userDetails) => <ProfileTable currentUser={currentUser} viewedUserDetails={userDetails} />}
            </AsyncContent>
        </>
    );
}