import { BlaiseApiClient } from "blaise-api-node-client";
import { Auth } from "blaise-login-react-server";
import dotenv from "dotenv";

import { loadConfigFromEnv } from "./config/appConfig.js";
import GetNodeServer from "./server.js";
import createLogger from "./utils/httpLogger.js";

const port: string = process.env.PORT || "5000";

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
