import app from "./server";
import pino from "pino";

const port: string = process.env.PORT || "5002";
const logger = pino();
app.listen(port);

logger.info("App is listening on port " + port);
