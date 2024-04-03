import React, { ChangeEvent, ReactElement, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { ONSPanel, ONSButton } from "blaise-design-system-react-components";
import { addNewUser, getAllRoles } from "../../utilities/http";
import { UserRole } from "blaise-api-node-client";
import { NewUser } from "blaise-api-node-client";
import FormTextInput from "../../form/TextInput";
import Form from "../../form";
import { passwordMatchedValidator, requiredValidator } from "../../form/FormValidators";
import Breadcrumbs from "../../components/Breadcrumbs";
import { UserForm } from "../../../interfaces";
import { BreadcrumbItem } from "../../../interfaces/breadcrumbs";

function NewUserComponent(): ReactElement {
    const [buttonLoading, setButtonLoading] = useState<boolean>(false);
    const [username, setUsername] = useState<string | undefined>("");
    const [role, setRole] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [redirect, setRedirect] = useState<boolean>(false);
    const [roleList, setRoleList] = useState<UserRole[]>([]);

    async function createNewUser(formData: UserForm) {
        setUsername(formData.username);
        if (formData.username && formData.password) {
            const newUser: NewUser = {
                name: formData.username,
                password: formData.password,
                role: role,
                defaultServerPark: "gusty",
                serverParks: ["gusty"]
            };

            setButtonLoading(true);
            const created = await addNewUser(newUser);

            if (!created) {
                setMessage("Failed to create new user");
                setButtonLoading(false);
                return;
            }

            setRedirect(true);
        }
    }

    useEffect(() => {
        getRoleList().then(() => { return; });
    }, []);

    async function getRoleList() {
        setRoleList([]);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_success, roleList] = await getAllRoles();

        setRole(roleList[0].name);
        setRoleList(roleList);
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
                    state={{ updatedPanel: { visible: true, message: "User " + username + " created", status: "success" } }}
                />
            }
            <Breadcrumbs BreadcrumbList={breadcrumbList} />

            <main id="main-content" className="ons-page__main ons-u-mt-no">
                <h1 className="ons-u-mb-l">Create new user</h1>
                <ONSPanel hidden={(message === "")} status="error">
                    {message}
                </ONSPanel>

                <Form onSubmit={(data) => createNewUser(data)}>
                    <FormTextInput
                        name="username"
                        validators={[requiredValidator]}
                        label={"Username"}
                    />
                    <FormTextInput
                        name="password"
                        validators={[requiredValidator]}
                        label={"Password"}
                        password={true}
                    />
                    <FormTextInput
                        name="confirm_password"
                        validators={[requiredValidator, passwordMatchedValidator]}
                        label={"Confirm password"}
                        password={true}
                    />
                    <p className="ons-field">
                        <label className="ons-label" htmlFor="role">Role
                        </label>
                        <select value={role} id="role" name="select" className="ons-input ons-input--select "
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}>
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
                        loading={buttonLoading}
                        submit={true} />
                </Form>
            </main>

        </>
    );
}

export default NewUserComponent;
