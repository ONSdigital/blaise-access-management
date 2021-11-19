import React, {ReactElement, useState} from "react";
import {Link, Redirect} from "react-router-dom";
import {ONSTextInput, ONSButton, ONSPanel, StyledForm, FormField} from "blaise-design-system-react-components";
import {Role} from "../../../Interfaces";
import {addNewRole} from "../../utilities/http";
import Breadcrumbs, {BreadcrumbItem} from "../../Components/Breadcrumbs";


function NewRole(): ReactElement {
    const [buttonLoading, setButtonLoading] = useState<boolean>(false);
    const [name, setName] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [redirect, setRedirect] = useState<boolean>(false);

    function validateRoleName(value: string) {
        let error;
        if (!value) {
            error = "Enter a name";
        }
        return error;
    }

    function validateDescription(value: string) {
        let error;
        if (!value) {
            error = "Enter a description";
        }
        return error;
    }


    const formElements: FormField[] = [
        {
            name: "name",
            type: "text",
            validate: validateRoleName
        },
        {
            name: "description",
            type: "text",
            validate: validateDescription
        }
    ];

    async function onFormSubmission(formValues: any, setSubmitting: (isSubmitting: boolean) => void) {
        setName(formValues.name);

        const newRole: Role = {
            permissions: [],
            name: formValues.name,
            description: formValues.description
        };

        const created = await addNewRole(newRole);

        if (!created) {
            console.error("Failed to create new role");
            setMessage("Failed to create new role");
            setSubmitting(false);
            return;
        }

        setSubmitting(false);
        setRedirect(true);

    }

    const breadcrumbList: BreadcrumbItem[] = [
        {link: "/", title: "Home"},
        {link: "/roles", title: "Manage roles"},
    ];


    return (
        <>
            {
                redirect && <Redirect to={{
                    pathname: "/roles",
                    state: {updatedPanel: {visible: true, message: "Role " + name + " created", status: "success"}}
                }}/>
            }
            <Breadcrumbs BreadcrumbList={breadcrumbList}/>
            <main id="main-content" className="page__main u-mt-no">
                <h1 className="u-mb-l">Create new role</h1>
                <ONSPanel hidden={(message === "")} status="error">
                    {message}
                </ONSPanel>

                <StyledForm fields={formElements} onSubmitFunction={onFormSubmission}/>
            </main>
        </>
    );
}

export default NewRole;
