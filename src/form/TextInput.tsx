import React, { ChangeEvent, ReactElement, useState } from "react";
import { isEmpty } from "lodash";
import withForm from "./WithForm";
import { TextInputProps } from "../interfaces/form";

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
                <label className="ons-label" htmlFor={props.name}>{props.label}
                </label>
                {
                    props.password &&
                    <span className="ons-checkbox ons-checkbox--toggle">
                        <input
                            type="checkbox"
                            id={`${props.name}-password-toggle`}
                            className="ons-checkbox__input"
                            name="show-password"
                            onClick={() => setShowPassword(!showPassword)}
                        />
                        <label id="password-toggle-label" className="ons-checkbox__label"
                            htmlFor={`${props.name}-password-toggle`}>
                            Show password
                        </label>
                    </span>
                }
                <input id={props.name} className="ons-input ons-input--text ons-input-type__input ons-u-mt-xs"
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
        <div className="ons-field">
            <div className={hasError ? "ons-panel ons-panel--error ons-panel--no-title ons-u-mb-s" : ""}>
                {hasError && <span className="ons-u-vh">Error: </span>}
                <div className={hasError ? "ons-panel__body" : ""}>
                    {
                        hasError &&
                        <p className="ons-panel__error">
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

export { TextInput };
export default FormTextInput;
