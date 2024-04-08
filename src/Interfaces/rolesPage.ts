import { UserRole } from "blaise-api-node-client";

export interface RolesTableProps {
    roles: UserRole[];
    listError: string;
}