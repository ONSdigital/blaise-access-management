import { type HttpLogger, type Options, pinoHttp } from "pino-http";

type RequestSerializerInput = {
  method?: string;
  url?: string;
  raw?: {
    user?: unknown;
  };
};

const PinoLevelToSeverityLookup = {
  trace: "DEBUG",
  debug: "DEBUG",
  info: "INFO",
  warn: "WARNING",
  error: "ERROR",
  fatal: "CRITICAL",
};

type PinoLevel = keyof typeof PinoLevelToSeverityLookup;

function isPinoLevel(label: unknown): label is PinoLevel {
  return typeof label === "string" && label in PinoLevelToSeverityLookup;
}

const defaultPinoConf = {
  messageKey: "message",
  formatters: {
    level(label: unknown, number: unknown) {
      return {
        severity: isPinoLevel(label)
          ? PinoLevelToSeverityLookup[label]
          : PinoLevelToSeverityLookup["info"],
        level: number,
      };
    },
    log(info: never) {
      return { info };
    },
  },
  serializers: {
    req: (req: RequestSerializerInput) => ({
      method: req.method,
      url: req.url,
      user: req.raw?.user,
    }),
  },
};

export default function createLogger(options: Options = { autoLogging: false }): HttpLogger {
  let pinoConfig = {};

  if (process.env.NODE_ENV === "production") {
    pinoConfig = defaultPinoConf;
  }

  return pinoHttp(Object.assign({}, options, pinoConfig));
}
