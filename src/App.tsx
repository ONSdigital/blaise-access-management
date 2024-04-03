import React, { ReactElement } from "react";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import Users from "./pages/users/Users";
import NewUserComponent from "./pages/users/NewUser";
import ChangePassword from "./pages/users/ChangePassword";
import DeleteUser from "./pages/users/DeleteUser";
import { NotProductionWarning, Footer, Header, BetaBanner, ErrorBoundary, DefaultErrorBoundary } from "blaise-design-system-react-components";
import Roles from "./pages/roles/Roles";
import BulkUserUpload from "./pages/users/BulkUserUpload/BulkUserUpload";
import Home from "./pages/Home";
import { User } from "blaise-api-node-client";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";

const divStyle = {
    minHeight: "calc(67vh)"
};

function App(): ReactElement {
    const location = useLocation();

    function AppContent({ loggedIn, user }: { loggedIn: boolean, user: User }): ReactElement {
        if (loggedIn && user) {
            return (
                <>
                    {/* <NavigationLinks /> */}
                    <div style={divStyle} className="ons-page__container ons-container">
                        <DefaultErrorBoundary>
                            <Routes>
                                <Route path={"/users/upload"}>
                                    <BulkUserUpload />
                                </Route>
                                <Route path={"/users/changepassword/:user"}>
                                    <ChangePassword />
                                </Route>
                                <Route path={"/users/delete/:user"}>
                                    <DeleteUser />
                                </Route>
                                <Route path={"/users/new"}>
                                    <NewUserComponent />
                                </Route>
                                <Route path={"/roles"}>
                                    <ErrorBoundary errorMessageText={"Unable to load role table correctly."}>
                                        <Roles />
                                    </ErrorBoundary>
                                </Route>
                                <Route path="/users">
                                    <ErrorBoundary errorMessageText={"Unable to load user table correctly."}>
                                        <Users currentUser={user} />
                                    </ErrorBoundary>
                                </Route>
                                <Route path="/">
                                    <ErrorBoundary errorMessageText={"Unable to load user table correctly."}>
                                        <Home />
                                    </ErrorBoundary>
                                </Route>
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
