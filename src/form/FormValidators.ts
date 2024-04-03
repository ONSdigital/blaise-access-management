import { UserForm } from "../../interfaces";

const requiredValidator = (val: string, name: string): string[] => {
    if (!val) {
        return [`Enter ${name.replace("_", " ")}`];
    }

    return [];
};

const passwordMatchedValidator = (val: string, name: string, formData: UserForm): string[] => {
    if (val !== formData.password) {
        return ["Must match password"];
    }

    return [];
};

export { requiredValidator, passwordMatchedValidator };
