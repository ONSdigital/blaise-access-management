interface Instrument {
    installDate: string
    name: string
    expired: boolean
    serverParkName: string
    activeToday: boolean
    surveyDays: string[]
    link: string
    fieldPeriod: string
    surveyTLA: string
}

interface Survey {
    instruments: Instrument[]
    survey: string
}

export type {Instrument, Survey};

export interface User {
    name: string
    password?: string
    role: string
    defaultServerPark: string
    serverParks: string[]
}

export interface ImportUser {
    name: string
    password: string
    role: string
    valid: boolean
    warnings: string[]
}

export interface UploadedUser {
    name: string
    created: boolean
}

export interface Role {
    name: string
    permissions: string[]
    description: string
}
