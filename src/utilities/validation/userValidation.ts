import { UserRole } from "blaise-api-node-client";
import { ImportUser } from "../../../Interfaces";

function validateUsers(users: ImportUser[], validRoles: UserRole[]) {
    users.map((user) => {
        validateUser(user, validRoles);
    });
}

function validateUser(user: ImportUser, validRoles: UserRole[]) {
    user.valid = true;
    user.warnings = [];

    if (user.name === undefined || user.name === null) {
        user.valid = false;
        user.warnings.push("Invalid name");
    }

    if (user.password === undefined || user.password === null) {
        user.valid = false;
        user.warnings.push("Invalid password");
    }

    if (user.role === undefined || user.role === null) {
        user.warnings.push("Invalid role");
        user.valid = false;
    } else {
        const isValidRole = validRoles.some(function (el) {
            return el.name === user.role;
        });

        if (!isValidRole) {
            user.warnings.push("Not a valid role");
            user.valid = false;
        }
    }
}

export { validateUsers, validateUser };