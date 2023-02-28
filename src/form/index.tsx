import React, {FormEvent, useState} from "react";
import { isEmpty } from "lodash";

interface Props {
  initialValues?: any
  onSubmit?: (data: any) => any
  onReset?: () => any
  children: React.ReactNode
}

interface State {
  data: any
  validators: any
  errors: any
}

const initState = (props: Props): State => {
  return {
    data: {
      ...props.initialValues
    },
    validators: {},
    errors: {}
  };
};

export let FormContext: any;
const { Provider } = (FormContext = React.createContext({}));

const Form = (props: Props) => {
  const [formState, setFormState] = useState<State>(initState(props));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (validate()) {
      if (props.onSubmit !== undefined) props.onSubmit(formState.data);
    }
  };

  const validate = () => {
    const { validators } = formState;

    // always reset form errors
    // in case there was form errors from backend
    setFormState(state => ({
      ...state,
      errors: {}
    }));

    if (isEmpty(validators)) {
      return true;
    }

    type Validators = [string, any];


    const formErrors = Object.entries(validators).reduce(
      (errors: any, [name, validators]: Validators) => {
        const { data }: any = formState;
        const messages = validators.reduce((result: any, validator: any) => {
          const value = data[name];
          const err = validator(value, name, data);
          return [...result, ...err];
        }, []);

        if (messages.length > 0) {
          errors[name] = messages;
        }

        return errors;
      },
      {}
    );

    if (isEmpty(formErrors)) {
      return true;
    }

    setFormState(state => ({
      ...state,
      errors: formErrors
    }));

    return false;
  };

  const onReset = (e: FormEvent) => {
    e.preventDefault();
    setFormState(initState(props));
    if (props.onReset) {
      props.onReset();
    }
  };

  const setFieldValue = (name: string, value: string) => {
    setFormState(state => {
      return {
        ...state,
        data: {
          ...state.data,
          [name]: value
        },
        errors: {
          ...state.errors,
          [name]: []
        }
      };
    });
  };
  type Validators = {name: string, validators: any};
  const registerInput = ({ name, validators }: Validators) => {
    setFormState(state => {
      return {
        ...state,
        validators: {
          ...state.validators,
          [name]: validators || []
        },
        // clear any errors
        errors: {
          ...state.errors,
          [name]: []
        }
      };
    });

    // returning unregister method
    return () => {
      setFormState(state => {
        // copy state to avoid mutating it
        const { data, errors, validators: currentValidators } = { ...state };

        // clear field data, validations and errors
        delete data[name];
        delete errors[name];
        delete currentValidators[name];

        return {
          data,
          errors,
          validators: currentValidators
        };
      });
    };
  };

  const providerValue = {
    errors: formState.errors,
    data: formState.data,
    setFieldValue,
    registerInput
  };

  const errorList = [];

  for (const key in formState.errors) {
    if (formState.errors[key].length) {
      errorList.push({fieldID: key, errorMessage: formState.errors[key]});
    }
  }

  return (
    <Provider value={providerValue}>
      {
        errorList.length > 0 &&
        <div aria-labelledby="error-summary-title" role="alert"
             className="ons-panel panel--error">
          <div className="ons-panel__header">
            <h2 id="error-summary-title" data-qa="error-header" className="ons-panel__title ons-u-fs-r--b">There
              are {errorList.length} problems with your answer</h2>
          </div>
          <div className="ons-panel__body">
            <ol className="ons-list">
              {
                errorList.map(({fieldID, errorMessage}) => {
                  return (
                      <li key={fieldID} className="ons-list__item">
                        <a href={`#${fieldID}`}
                           className="ons-list__link ons-js-inpagelink">{errorMessage[0]}</a>
                      </li>
                  );
                })
              }
            </ol>
          </div>
        </div>
      }

      <form
        onSubmit={onSubmit}
        onReset={onReset}
        className={"ons-u-mt-m"}
      >
        {props.children}
      </form>
    </Provider>
  );
};

export default Form;
