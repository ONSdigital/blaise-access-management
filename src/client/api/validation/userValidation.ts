import { type ImportUser } from "../../types/userImport.types";
import { getAllRoles, getAllUsers } from "../http";

import type { User, UserRole } from "blaise-api-node-client";

async function getRoles(): Promise<UserRole[]> {
  const { success, data: roles } = await getAllRoles();

  if (success) {
    return roles;
  }

  return [];
}

async function getExistingUsers(): Promise<User[]> {
  const { success, data: users } = await getAllUsers();

  if (success) {
    return users;
  }

  return [];
}

async function validateImportedUsers(users: ImportUser[]): Promise<void> {
  const validRoles = await getRoles();
  const existingUsers = await getExistingUsers();

  users.forEach((user) => {
    validateUser(user, validRoles, existingUsers);
  });
}

function validateUser(user: ImportUser, validRoles: UserRole[], existingUsers: User[]): void {
  const warnings: string[] = [];

  if (existingUsers.find((existingUser) => existingUser.name === user.name)) {
    warnings.push("User already exists");
  }

  if (user.name === undefined || user.name === null) {
    warnings.push("Invalid name");
  }

  if (!user.password || user.password === null) {
    warnings.push("Invalid password");
  }

  if (user.role === undefined || user.role === null) {
    warnings.push("Invalid role");
  } else {
    const isValidRole = validRoles.some((role) => role.name === user.role);

    if (!isValidRole) {
      warnings.push("Not a valid role");
    }
  }

  user.warnings = warnings;
  user.valid = warnings.length === 0;
}

export { validateImportedUsers, validateUser };
