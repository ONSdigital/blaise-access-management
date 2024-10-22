import React from "react";
import { ONSButton, ONSErrorPanel, ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";
import { ChangeEvent, ReactElement, useEffect, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import Breadcrumbs from "../../../Components/Breadcrumbs";
import { BreadcrumbItem } from "../../../Interfaces";
import { RedirectWithData, UserRouteParams } from "../../../Interfaces/usersPage";
import { getAllRoles, patchUserRolesAndPermissions } from "../../../api/http";
import { UserRole } from "blaise-api-node-client";
import Form from "../../../Components/form";
import UserSignInErrorPanel from "../../../Components/UserSignInErrorPanel";

export default function ChangeRole(): ReactElement {
    const { user: viewedUsername }: UserRouteParams = useParams() as unknown as UserRouteParams;
    const { state } = useLocation();
    const { currentUser, viewedUserDetails } = state || { currentUser: null, viewedUserDetails: null };
    const [role, setRole] = useState<string>(viewedUserDetails?.data?.role ?? "");
    const [roleList, setRoleList] = useState<UserRole[]>([]);
    const [redirectWithData, setRedirectWithData] = useState<RedirectWithData>({ redirect: false, visible: false, message: "", statusType: "" });
    const [setError, setSetError] = useState<string | null>(null);
    const [setLoading, setSetLoading] = useState<boolean>(true);

    const getRoleList = async () => {
        try {
            const [_success, roleList] = await getAllRoles();
            setRoleList(roleList);
            setSetLoading(false);
        } catch (error) {
            setSetError("Failed to fetch roles list, please try again");
            setSetLoading(false);
        }
    };

    const handleChangeRole = (e: ChangeEvent<HTMLSelectElement>) => {
        setRole(e.target.value);
        return;
    };

    const changeBlaiseUserRolesAndServerParks = async () => {
        if (!viewedUserDetails || !viewedUserDetails.data) {
            console.log("Viewed user details is undefined or null");
            return;
        }

        if (role === viewedUserDetails.role) {
            console.log("User already has role: ", role);
            return;
        }

        if (roleList.some((userRole) => userRole.name === role)) {
            const res = await patchUserRolesAndPermissions(viewedUsername, role);
            setRedirectWithData({ redirect: true, visible: true, message: res?.message || "", statusType: res?.status === 500 ? "error" : "success" });
        } else {
            window.alert(`Invalid role: ${role}`);
            console.log("Invalid Role:", role);
            return;
        }
    };

    const breadcrumbList: BreadcrumbItem[] = [
        { link: "/", title: "Home" },
        { link: "/users/", title: "Manage users" },
        { link: `/users/${viewedUsername}`, title: "View user", state: { currentUser } }
    ];

    useEffect(() => {
        getRoleList();
    }, []);

    if (!currentUser || !viewedUserDetails || setError) {
        return setError ? (<ONSPanel status="error">{setError}</ONSPanel>) : (<UserSignInErrorPanel/>);
    }

    return (
        <>
            {
                redirectWithData.redirect && <Navigate
                    to={{ pathname: `/users/${viewedUsername}` }}
                    state={{
                        currentUser,
                        updatedPanel: {
                            visible: redirectWithData.visible,
                            message: redirectWithData.message,
                            status: redirectWithData.statusType
                        }
                    }}
                />
            }
            <Breadcrumbs BreadcrumbList={breadcrumbList} />
            {
                setLoading ? (
                    <ONSLoadingPanel />
                ) : (
                    <main id="main-content" className="ons-page__main ons-u-mt-no">
                        <h1 className="ons-u-mb-l">Change current role for user <em>{viewedUsername}</em></h1>
                        <h2 className="ons-u-mb-l">Current role: <em>{viewedUserDetails?.data?.role ?? "N/A"}</em></h2>
                        <Form onSubmit={() => changeBlaiseUserRolesAndServerParks()}>
                            <p className="ons-field">
                                <label className="ons-label" htmlFor="new-user-role">New Role
                                </label>
                                <select value={role} id="new-user-role" name="select-role" className="ons-input ons-input--select "
                                    onChange={(e) => handleChangeRole(e)}>
                                    {
                                        roleList.map((option: UserRole) => {
                                            return (<option key={option.name} value={option.name}>{option.name}</option>);
                                        })
                                    }
                                </select>
                            </p>
                            <ONSButton
                                label={"Save"}
                                primary={true}
                                submit={true} />
                        </Form>
                    </main>
                )
            }
        </>
    );
}
