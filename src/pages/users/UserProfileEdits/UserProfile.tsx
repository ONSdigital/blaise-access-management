import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Breadcrumbs from "../../../Components/Breadcrumbs";
import ProfileTable from "./ProfileTable";
import { getUser } from "../../../api/http";
import { ONSPanel, ONSLoadingPanel, ONSErrorPanel } from "blaise-design-system-react-components";
import { GetUserResponse } from "../../../Interfaces/usersPage";
import UserSignInErrorPanel from "../../../Components/UserSignInErrorPanel";

export default function UserProfile() {
    const { user: viewedUsername } = useParams();
    const { state } = useLocation();
    const { currentUser, updatedPanel } = state || { currentUser: null, updatedPanel: null };
    const [viewedUserDetails, setViewedUserDetails] = useState<GetUserResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    const fetchUserDetails = async () => {
        setLoading(true);
        try {
            const data = await getUser(viewedUsername as string);
            setViewedUserDetails(data);
            setError("");
        } catch (err) {
            setError("Unable to load user details, please try again. If this continues, please the contact service desk.");
            setViewedUserDetails(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (viewedUsername) {
            fetchUserDetails();
        }
    }, [viewedUsername]);

    if (!currentUser) {
        return <UserSignInErrorPanel />;
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
            {error && <ONSPanel status={"error"}>
                <div className="ons-panel__body">{error}</div>
            </ONSPanel>}
            {loading ? (
                <ONSLoadingPanel />
            ) : (
                viewedUserDetails && <ProfileTable currentUser={currentUser} viewedUserDetails={viewedUserDetails} />
            )}
        </>
    );
}