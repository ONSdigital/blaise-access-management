import { AuthConfig } from "blaise-login-react/blaise-login-react-server";
import { string } from "prop-types";

export interface CustomConfig extends AuthConfig {
    BlaiseApiUrl: string
    ProjectId: string
    ServerPark: string,
    RoleToServerParksMap: { [key: string]: string[] }
}