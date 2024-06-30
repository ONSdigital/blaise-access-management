import React, { ReactElement } from "react";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import Users from "./pages/users/Users";
import NewUserComponent from "./pages/users/UserUpload/NewUser";
import ChangePassword from "./pages/users/UserProfileEdits/ChangePassword";
import DeleteUser from "./pages/users/UserProfileEdits/DeleteUser";
import { NotProductionWarning, Footer, Header, BetaBanner, ErrorBoundary, DefaultErrorBoundary } from "blaise-design-system-react-components";
import Roles from "./pages/roles/Roles";
import BulkUserUpload from "./pages/users/UserUpload/BulkUserUpload";
import Home from "./pages/Home";
import { User } from "blaise-api-node-client";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";
import UserProfile from "./pages/users/UserProfileEdits/UserProfile";
import ChangeRole from "./pages/users/UserProfileEdits/ChangeRole";

const divStyle = {
    minHeight: "calc(67vh)"
};

function App(): ReactElement {
    const location = useLocation();

    function AppContent({ loggedIn, user }: { loggedIn: boolean, user: User }): ReactElement {
        if (loggedIn && user) {
            return (
                <>
                    <div style={divStyle} className="ons-page__container ons-container">
                        <DefaultErrorBoundary>
                            <Routes>
                                <Route path={"/users/change-password/:user"} element={<ChangePassword />} />
                                <Route path={"/users/delete/:user"} element={<DeleteUser />} />
                                <Route path="/users/change-role/:user" element={
                                    <ErrorBoundary errorMessageText={"Unable to change role for user. Please try again."}>
                                        <ChangeRole />
                                    </ErrorBoundary>
                                } />
                                <Route path="/users/:user" element={
                                    <ErrorBoundary errorMessageText={"Unable to load user. Please try again."}>
                                        <UserProfile />
                                    </ErrorBoundary>
                                } />
                                <Route path={"/users/upload"} element={<BulkUserUpload />} />
                                <Route path={"/users/new"} element={<NewUserComponent />} />
                                <Route path="/users" element={
                                    <ErrorBoundary errorMessageText={"Unable to load users table. Please try again."}>
                                        <Users currentUser={user} />
                                    </ErrorBoundary>
                                }/>
                                <Route path={"/roles"} element={
                                    <ErrorBoundary errorMessageText={"Unable to load roles table. Please try again."}>
                                        <Roles />
                                    </ErrorBoundary>
                                }/>
                                <Route path="/" element={
                                    <ErrorBoundary errorMessageText={"Unable to load homepage. Please try again."}>
                                        <Home />
                                    </ErrorBoundary>
                                }/>
                            </Routes>
                        </DefaultErrorBoundary>
                    </div>
                </>
            );
        }
        return <></>;
    }

    return (
        <Authenticate title="Blaise Access Management">
            {(user, loggedIn, logOutFunction) => (
                <>
                    {
                        (window.location.hostname.includes("dev")) && <NotProductionWarning />
                    }
                    <BetaBanner />
                    <Header
                        title={"Blaise Access Management"}
                        signOutButton={loggedIn}
                        noSave={true}
                        signOutFunction={logOutFunction}
                        navigationLinks={
                            [
                                {
                                    id: "home-link",
                                    label: "Home",
                                    endpoint: "/"
                                },
                                {
                                    id: "users-link",
                                    label: "Manage users",
                                    endpoint: "/users"
                                },
                                {
                                    id: "roles-link",
                                    label: "Manage roles",
                                    endpoint: "/roles"
                                }
                            ]
                        }
                        currentLocation={location.pathname}
                        createNavLink={(id: string, label: string, endpoint: string) => (
                            <Link to={endpoint} id={id} className="ons-navigation__link">
                                {label}
                            </Link>
                        )}

                    />
                    <AppContent loggedIn={loggedIn} user={user} />
                    <Footer />
                </>
            )}
        </Authenticate>
    );
}

export default App;
