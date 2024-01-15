export interface UploadedUser {
    name: string
    created: boolean
}

export interface ImportUser {
    name: string
    password: string
    role: string
    valid: boolean
    warnings: string[]
}

type JSONValue =
    | string
    | { [x: string]: JSONValue };

export interface JSONObject {
    [x: string]: JSONValue;
}

export interface UserForm {
    username?: string
    password?: string
    confirm_password?: string
}