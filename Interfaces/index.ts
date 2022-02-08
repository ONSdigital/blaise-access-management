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
