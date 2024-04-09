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

export interface ValidatorType { name: string, validators: ((val: string, name: string, formData: { [key: string]: string }) => string[])[] }

export interface ContextProviderType {
    errors: {
        [key: string]: string[];
    };
    data: {
        [key: string]: string;
    };
    setFieldValue: (name: string, value: string) => void;
    registerInput: ({ name, validators }: ValidatorType) => () => void;
}

export interface BreadcrumbItem {
    link: string
    title: string
}

export interface BreadcrumbProps {
    BreadcrumbList: BreadcrumbItem[]
}