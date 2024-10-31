import GetNodeServer from "./server";
import { loadConfigFromEnv } from "./Config";
import BlaiseApiClient from "blaise-api-node-client";
import { Auth } from "blaise-login-react/blaise-login-react-server";
import dotenv from "dotenv";
import createLogger from "./logger/pinoLogger";

const port: string = process.env.PORT || "5002";

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}
const config = loadConfigFromEnv();
const blaiseApiClient = new BlaiseApiClient(config.BlaiseApiUrl);
const auth = new Auth(config);
const pinoLogger = createLogger();
const server = GetNodeServer(config, blaiseApiClient, auth, pinoLogger);
server.listen(port);

pinoLogger.logger.info("BAM nodejs server is listening on port " + port);
