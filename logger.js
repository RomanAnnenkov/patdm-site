import pino from "pino";

const fileTransport = pino.transport({
  target: "pino/file",
  options: { destination: "logs/app.log" },
});

const logger = pino(
  {
    level: process.env.PINO_LOG_LEVEL || "info",
    formatters: {
      bindings: (bindings) => {
        return { pid: bindings.pid, host: bindings.hostname };
      },
      level: (label) => {
        return { level: label.toUpperCase() };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  fileTransport
);

export default logger;
