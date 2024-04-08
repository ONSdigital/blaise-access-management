import { User, UserRole } from "blaise-api-node-client";
import { ImportUser } from "../../Interfaces";
import { getAllRoles, getAllUsers } from "../http";

async function getRoles(): Promise<UserRole[]> {
    const [success, roles] = await getAllRoles();
    if (success) {
        return roles;
    }

    return [];
}

async function getExistingUsers(): Promise<User[]> {
    const [success, users] = await getAllUsers();
    if (success) {
        return users;
    }

    return [];
}

async function validateImportedUsers(users: ImportUser[]): Promise<void> {
    const validRoles = await getRoles();
    const existingUsers = await getExistingUsers();

    users.map((user) => {
        validateUser(user, validRoles, existingUsers);
        console.debug(user);
    });
}

function validateUser(user: ImportUser, validRoles: UserRole[], existingUsers: User[]): void  {
    user.valid = true;
    user.warnings = [];

    if(existingUsers.find(existingUser => existingUser.name===user.name)) {
        user.valid = false;
        user.warnings.push("User already exists");
    }

    if (user.name === undefined || user.name === null) {
        user.valid = false;
        user.warnings.push("Invalid name");
    }

    if (!user.password || user.password === null) {
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

export { validateImportedUsers, validateUser };