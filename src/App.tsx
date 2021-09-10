import React, {ReactElement, useEffect, useState} from "react";
import {DefaultErrorBoundary} from "./Components/ErrorHandling/DefaultErrorBoundary";
import {isDevEnv} from "./Functions";
import {Switch, Route, Redirect, useLocation} from "react-router-dom";
import Users from "./pages/users/Users";
import {User} from "../Interfaces";
import {ErrorBoundary} from "./Components/ErrorHandling/ErrorBoundary";
import NewUser from "./pages/users/NewUser";
import ChangePassword from "./pages/users/ChangePassword";
import DeleteUser from "./pages/users/DeleteUser";
import SignIn from "./pages/SignIn";
import NewRole from "./pages/roles/NewRole";
import {NotProductionWarning, Footer, Header, ONSPanel, BetaBanner} from "blaise-design-system-react-components";
import Roles from "./pages/roles/Roles";
import BulkUserUpload from "./pages/users/BulkUserUpload/BulkUserUpload";
import Home from "./pages/Home";

interface Panel {
    visible: boolean
    message: string
    status: string
}

interface window extends Window {
    VM_EXTERNAL_CLIENT_URL: string
    CATI_DASHBOARD_URL: string
}

const divStyle = {
    minHeight: "calc(67vh)"
};

interface Panel {
    visible: boolean
    message: string
    status: string
}


interface location {
    state: any
}

function App(): ReactElement {

    const [externalCATIUrl, setExternalCATIUrl] = useState<string>("/Blaise");
    const defaultPanel = {visible: false, message: "", status: "info"};
    const [panel, setPanel] = useState<Panel>(defaultPanel);

    const {state}: location = useLocation();
    const {updatedPanel} = state || {updatedPanel: panel};

    useEffect(() => {
        if (updatedPanel === null || updatedPanel?.message === undefined) {
            return;
        }
        if (updatedPanel.message !== panel.message) {
            updatePanel(updatedPanel.visible, updatedPanel.message, updatedPanel.status);
        }

    }, [updatedPanel]);

    const updatePanel = (visible = false, message = "", status = "info") => {
        setPanel(
            {visible: visible, message: message, status: status}
        );
    };


    useEffect(function retrieveVariables() {
        setExternalCATIUrl(isDevEnv() ?
            process.env.REACT_APP_CATI_DASHBOARD_URL || externalCATIUrl : (window as unknown as window).CATI_DASHBOARD_URL);
    }, [externalCATIUrl]);


    function loginUser(user: User) {
        setAuthenticatedUser(user);
        setUserAuthenticated(true);
        updatePanel();
    }

    function signOutUser() {
        setAuthenticatedUser(emptyUser);
        setUserAuthenticated(false);
        updatePanel(true, "Successfully signed out", "success");
    }


    const emptyUser: User = {
        defaultServerPark: "",
        password: "",
        serverParks: [],
        name: "", role: ""
    };
    const [authenticatedUser, setAuthenticatedUser] = useState<User>(emptyUser);
    const [userAuthenticated, setUserAuthenticated] = useState<boolean>(false);


    // A wrapper for <Route> that redirects to the login
    // screen if you're not yet authenticated.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line react/prop-types
    function PrivateRoute({children, ...rest}) {
        return (
            <Route
                exact
                {...rest}
                render={({location}) =>
                    userAuthenticated ? (
                        children
                    ) : (
                        <Redirect
                            to={{
                                pathname: "/signin",
                                state: {from: location}
                            }}
                        />
                    )
                }
            />
        );
    }


    return (
        <>
            {
                (window.location.hostname.includes("dev")) && <NotProductionWarning/>
            }
            <BetaBanner/>
            <Header title={"Blaise User Management"} signOutButton={userAuthenticated} signOutFunction={() => signOutUser()}/>
            <div style={divStyle} className="page__container container">
                <main id="main-content" className="page__main">
                    <ONSPanel hidden={!panel.visible} status={panel.status}>
                        <p>{panel.message}</p>
                    </ONSPanel>
                    <DefaultErrorBoundary>
                        <Switch>
                            <PrivateRoute path={"/user/upload"}>
                                <BulkUserUpload/>
                            </PrivateRoute>
                            <PrivateRoute path={"/user/changepassword/:user"}>
                                <ChangePassword/>
                            </PrivateRoute>
                            <PrivateRoute path={"/user/delete/:user"}>
                                <DeleteUser/>
                            </PrivateRoute>
                            <PrivateRoute path={"/user"}>
                                <NewUser/>
                            </PrivateRoute>
                            <PrivateRoute path={"/roles/new"}>
                                <NewRole/>
                            </PrivateRoute>
                            <PrivateRoute path={"/roles"}>
                                <ErrorBoundary errorMessageText={"Unable to load role table correctly."}>
                                    <Roles/>
                                </ErrorBoundary>
                            </PrivateRoute>
                            <Route path="/signin">
                                <ErrorBoundary errorMessageText={"Unable to load survey table correctly."}>
                                    <SignIn setAuthenticatedUser={loginUser}/>
                                </ErrorBoundary>
                            </Route>
                            <PrivateRoute path="/users">
                                <ErrorBoundary errorMessageText={"Unable to load user table correctly."}>
                                    <Users currentUser={authenticatedUser}
                                           externalCATIUrl={externalCATIUrl}/>
                                </ErrorBoundary>
                            </PrivateRoute>
                            <PrivateRoute path="/">
                            <ErrorBoundary errorMessageText={"Unable to load user table correctly."}>
                                <Home user={authenticatedUser}/>
                            </ErrorBoundary>
                        </PrivateRoute>
                        </Switch>
                    </DefaultErrorBoundary>
                </main>
            </div>
            <Footer/>
        </>
    );
}

export default App;
