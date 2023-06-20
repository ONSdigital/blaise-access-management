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

export interface Role {
    name: string
    permissions: string[]
    description: string
}
