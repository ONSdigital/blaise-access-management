import React, {ReactElement, useState} from "react";
import {Link, Redirect} from "react-router-dom";
import {ONSTextInput, ONSButton, ONSPanel} from "blaise-design-system-react-components";
import {Role} from "../../../Interfaces";
import {addNewRole} from "../../utilities/http";



function NewRole(): ReactElement {
    const [buttonLoading, setButtonLoading] = useState<boolean>(false);
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [redirect, setRedirect] = useState<boolean>(false);

    async function createNewUser() {
        if (name === "") {
            setMessage("Name cannot be blank");
            return;
        }

        if (description === "") {
            setMessage("Description cannot be blank");
            return;
        }

        const newRole: Role = {
            permissions: [],
            name: name,
            description: description
        };

        setButtonLoading(true);
        const created = await addNewRole(newRole);

        if (!created) {
            console.error("Failed to create new role");
            setMessage("Failed to create new role");
            setButtonLoading(false);
            return;
        }

        setRedirect(true);
    }


    return (
        <>
            {
                redirect && <Redirect to={{
                    pathname: "/roles",
                    state: {updatedPanel: {visible: true, message: "Role " + name + " created", status: "success"} }
                }}/>
            }
            <p className="u-mt-m">
                <Link to={"/roles"}>Previous</Link>
            </p>
            <h1>Create new role</h1>
            <ONSPanel hidden={(message === "")} status="error">
                {message}
            </ONSPanel>
            <form onSubmit={() => createNewUser()}>
                <ONSTextInput label={"Name"}
                              autoFocus={true}
                              value={name}
                              onChange={(e) => setName(e.target.value)} zIndex={0}/>
                <ONSTextInput label={"Description"}
                              value={description}
                              onChange={(e) => setDescription(e.target.value)} zIndex={0}/>
                <ONSButton
                    label={"Save"}
                    primary={true}
                    loading={buttonLoading}
                    onClick={() => createNewUser()}/>
            </form>


        </>
    );
}

export default NewRole;
