import React, { useContext, useEffect } from "react";
import PropTypes from "prop-types";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { FormContext } from "./index";
import { TextInput } from "./TextInput";
import { TextInputProps } from "../../Interfaces/form";

const propTypes = {
    name: PropTypes.string.isRequired,
    validators: PropTypes.arrayOf(PropTypes.func)
};

const withForm = (InputComponent: typeof TextInput) => {
    const WrappedWithForm = (props: TextInputProps) => {
        const { errors, data, setFieldValue, registerInput } = useContext(FormContext);

        useEffect(
            () =>
                registerInput({
                    name: props.name,
                    validators: props.validators
                }),
            []
        );

        const onChange = (val: string) => {
            setFieldValue(props.name, val);
            if (props.onChange) {
                props.onChange(val);
            }
        };
        const inputValue = data[props.name];
        const inputErrors = errors[props.name] || [];

        return (
            <InputComponent
                {...props}
                errors={inputErrors}
                value={inputValue}
                onChange={onChange}
            />
        );
    };

    WrappedWithForm.propTypes = propTypes;
    return WrappedWithForm;
};

export default withForm;
