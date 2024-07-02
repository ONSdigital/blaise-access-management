import axios from "axios";

export * from "./users";
export * from "./roles";

export function handleAxiosError(error: unknown): { status: number; message: string, error: unknown } {
    if (axios.isAxiosError(error)) {
        return {
            status: error.response?.status || 500,
            message: error.response?.data.message || "Axios error occurred with no specific message",
            error: error
        };
    } else {
        return {
            status: 500,
            message: "An unknown error occurred, please raise a ServiceNow call if this continues: " + error,
            error: error
        };
    }
}