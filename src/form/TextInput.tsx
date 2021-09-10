import React, {ChangeEvent, ReactElement, useState} from "react";
import {isEmpty} from "lodash";
import withForm from "./WithForm";

export interface TextInputProps {
    placeholder?: string
    name: string
    value?: string
    label: string
    type?: string
    errors?: string[]
    onChange?: (val: string) => any
    validators: ((val: string, name: string, formData: any) => string[])[]
    password?: boolean
}

const TextInput = (props: TextInputProps): ReactElement => {
    const hasError = !isEmpty(props.errors);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const renderErrors = () => {
        if (!hasError) {
            return null;
        }

        if (props.errors) {
            return props.errors.map((errMsg) => (
                `${errMsg} `
            ));
        }
    };

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (props.onChange !== undefined) props.onChange(val);
    };

    function getInput() {
        return (
            <>
                <label className="label" htmlFor={props.name}>{props.label}
                </label>
                {
                    props.password &&
                    <span className="checkbox checkbox--toggle">
                    <input
                        type="checkbox"
                        id={`${props.name}-password-toggle`}
                        className="checkbox__input"
                        name="show-password"
                        onClick={() => setShowPassword(!showPassword)}
                    />
                    <label id="password-toggle-label" className="checkbox__label"
                           htmlFor={`${props.name}-password-toggle`}>
                        Show password
                    </label>
                </span>
                }
                <input id={props.name} className="input input--text input-type__input u-mt-xs"
                       name={props.name}
                       autoComplete={props.password ? "current-password" : undefined}
                       type={props.password ? showPassword ? "text" : "password" : "text"}
                       placeholder={props.placeholder}
                       onChange={onChange}
                />
            </>
        );
    }

    return (
        <div className="field">
            <div className={hasError ? "panel panel--error panel--no-title u-mb-s" : ""}>
                {hasError && <span className="u-vh">Error: </span>}
                <div className={hasError ? "panel__body" : ""}>
                    {
                        hasError &&
                        <p className="panel__error">
                            <strong>{renderErrors()}</strong>
                        </p>
                    }
                    {getInput()}
                </div>
            </div>
        </div>
    );
};

const FormTextInput = withForm(TextInput);

export {TextInput};
export default FormTextInput;
