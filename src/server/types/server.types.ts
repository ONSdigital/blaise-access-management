import { type AuthConfig } from "blaise-login-react-server";

export interface CustomConfig extends AuthConfig {
  BlaiseApiUrl: string;
  ProjectId: string;
  ServerPark: string;
  URLDomain: string;
  RoleToServerParksMap: { [key: string]: string[] };
}
