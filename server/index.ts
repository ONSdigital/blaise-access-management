import GetNodeServer from "./server";
import pino from "pino";
import { loadConfigFromEnv } from "./Config";
import BlaiseApiClient from "blaise-api-node-client";
import { Auth } from "blaise-login-react/blaise-login-react-server";
import dotenv from "dotenv";

const port: string = process.env.PORT || "5002";
const logger = pino();

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}
const config = loadConfigFromEnv();
const blaiseApiClient = new BlaiseApiClient(config.BlaiseApiUrl);
const auth = new Auth(config);
const server = GetNodeServer(config, blaiseApiClient, auth);
server.listen(port);

logger.info("App is listening on port " + port);
