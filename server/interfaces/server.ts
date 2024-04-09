import { AuthConfig } from "blaise-login-react/blaise-login-react-server";

export interface CustomConfig extends AuthConfig {
    BlaiseApiUrl: string
    ProjectId: string
    ServerPark: string
}