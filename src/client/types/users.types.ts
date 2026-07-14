import { type ImportUser, type UploadedUser } from "./userImport.types";

import type { User } from "blaise-api-node-client";

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
  usersToImport: ImportUser[];
  uploadUsers: () => void;
}

export interface UsersUploadedSummaryProps {
  usersUploaded: UploadedUser[];
  numberOfValidUsers: number;
}

export interface ReturnPanel {
  visible: boolean;
  message: string;
  status: "success" | "error" | "info" | "warn";
}

export interface RedirectWithData {
  redirect: boolean;
  visible: boolean;
  message: string;
  statusType: "success" | "error" | "info" | "warn" | "";
}
