import { server } from "./server";
import pino from "pino";

const port: string = process.env.PORT || "5002";
const logger = pino();
server.listen(port);

logger.info("App is listening on port " + port);
