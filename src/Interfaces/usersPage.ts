import { User } from "blaise-api-node-client";
import { ImportUser, UploadedUser } from ".";

export interface UserRouteParams {
    user: string;
}

export interface UsersProps {
    currentUser: User | undefined;
}

export interface UsersTableProps {
    users: User[];
    currentUser: User | undefined;
    listError: string;
}

export interface SelectFileProps {
    setUsersToUpload: (users: ImportUser[]) => void;
    movePageForward: () => void;
}

export interface UsersToUploadSummaryProps {
    usersToImport: ImportUser[]
    uploadUsers: () => void
}

export interface UsersUploadedSummaryProps {
    usersUploaded: UploadedUser[]
    numberOfValidUsers: number
}

export interface ReturnPanel {
    visible: boolean
    message: string
    status: string
}

export interface GetUserResponse {
    status: number;
    message: string;
    data: User | Record<string, never>;
    error?: unknown;
}

export interface PatchUserRoleResponse {
    status: number;
    message: string;
    error?: unknown;
}

export type GetUsersListResponse = [boolean, User[]];

export interface RedirectWithData {
    redirect: boolean;
    visible: boolean;
    message: string;
    statusType: string;
}