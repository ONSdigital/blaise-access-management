import React, {ReactElement, useEffect, useState} from "react";
import {Switch, Route, useLocation, Link} from "react-router-dom";
import Users from "./pages/users/Users";
import NewUserComponent from "./pages/users/NewUser";
import ChangePassword from "./pages/users/ChangePassword";
import DeleteUser from "./pages/users/DeleteUser";
import {NotProductionWarning, Footer, Header, BetaBanner, ErrorBoundary, DefaultErrorBoundary, ONSLoadingPanel} from "blaise-design-system-react-components";
import Roles from "./pages/roles/Roles";
import BulkUserUpload from "./pages/users/BulkUserUpload/BulkUserUpload";
import Home from "./pages/Home";
import {LoginForm, AuthManager} from "blaise-login-react-client";
import {User} from "blaise-api-node-client";
import {getCurrentUser} from "blaise-login-react-client";

const divStyle = {
    minHeight: "calc(67vh)"
};

function App(): ReactElement {
    const authManager = new AuthManager();
    const location = useLocation();
    const [loaded, setLoaded] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<User>();

    useEffect(() => {
        authManager.loggedIn().then(async (isLoggedIn: boolean) => {
          setLoggedIn(isLoggedIn);
          if (isLoggedIn) {
            getCurrentUser(authManager).then((user: User) => {
              setCurrentUser(user);
            });
          }
          setLoaded(true);
        });
      });

    function loginPage(): ReactElement {
        if (loaded && loggedIn) {
            return <></>;
        }
        return (
            <div style={divStyle} className="ons-page__container ons-container">
                <LoginForm authManager={authManager} setLoggedIn={setLoggedIn} />
            </div>
        );
    }

    function signOut(): void {
        authManager.clearToken();
        setLoggedIn(false);
    }

    function loading(): ReactElement {
        if (loaded) {
            return <></>;
        }
        return (
            <div style={divStyle} className="ons-page__container ons-container">
                <ONSLoadingPanel />
            </div>
        );
    }

    function app(): ReactElement {
        if (loaded && loggedIn) {
            return (
                <>
                    {/* <NavigationLinks /> */}
                    <div style={divStyle} className="ons-page__container ons-container">
                        <DefaultErrorBoundary>
                            <Switch>
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
                                        <Users currentUser={currentUser} />
                                    </ErrorBoundary>
                                </Route>
                                <Route path="/">
                                    <ErrorBoundary errorMessageText={"Unable to load user table correctly."}>
                                        <Home user={currentUser} />
                                    </ErrorBoundary>
                                </Route>
                            </Switch>
                        </DefaultErrorBoundary>
                    </div>
                </>
            );
        }
        return <></>;
    }

    return (
        <>
            {
                (window.location.hostname.includes("dev")) && <NotProductionWarning />
            }
            <BetaBanner />
            <Header
                title={"Blaise Access Management"}
                signOutButton={loggedIn}
                noSave={true}
                signOutFunction={signOut}
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
            {loading()}
            {loginPage()}
            {app()}
            <Footer />
        </>
    );
}

export default App;
