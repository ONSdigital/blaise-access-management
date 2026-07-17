import { sendClientLog } from "./clientLog";

type Args = unknown[];

export const clientLogger = {
  debug: (...args: Args) => void sendClientLog("debug", ...args),
  info: (...args: Args) => void sendClientLog("info", ...args),
  warn: (...args: Args) => void sendClientLog("warn", ...args),
  error: (...args: Args) => void sendClientLog("error", ...args),
};
