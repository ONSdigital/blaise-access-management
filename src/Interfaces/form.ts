import { FormEvent } from "react";
import { UserForm } from ".";

export interface CustomFormProps {
    initialValues?: { [key: string]: string }
    onSubmit?: (data: { [key: string]: string }) => void
    onReset?: () => FormEvent<HTMLFormElement>
    children: React.ReactNode
}

export interface CustomFormState {
    data: { [key: string]: string }
    validators: { [key: string]: ((val: string, name: string, formData: UserForm) => string[])[] | unknown }
    errors: { [key: string]: string[] }
}

export interface TextInputProps {
    placeholder?: string
    name: string
    value?: string
    label: string
    type?: string
    errors?: string[]
    onChange?: (val: string) => void
    validators: ((val: string, name: string, formData: UserForm) => string[])[]
    password?: boolean
}