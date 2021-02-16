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
    role: string
    defaultServerPark: string
    serverParks: string[]
}

export interface Role {
    name: string
    permissions: string[]
    description: string
}
