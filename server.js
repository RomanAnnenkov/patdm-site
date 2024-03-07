import express from "express";
import multer from "multer";
import path from "path";
import cors from "cors";
import config from "config";
import logger from "./logger.js";
import fs from "fs";

const app = express();
const storage = multer.diskStorage({
  destination: (_, __, callBack) => {
    callBack(null, "storage");
  },
  filename: (_, file, callBack) => {
    callBack(null, file.originalname);
  },
});
const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use("/storage", express.static("storage"));
app.use("/static", express.static(path.resolve("frontend", "static")));

app.get("/", (req, res) => {
  res.sendFile(path.resolve("frontend", "index.html"));
});

app.get("/health-check", (req, res) => {
  res.sendStatus(200);
});

app.post("/upload", upload.single("image"), async (req, res) => {
  const pathToFile = `storage/${req.file.originalname}`;
  const response = await fetch(
    `${config.get("App.converter.url")}/process-file`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify({ filePath: pathToFile }),
    }
  )
    .then((responseFromServer) => responseFromServer.json())
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
      logger.error(err);
    });
});

app.listen(config.get("App.web.port"), (err) => {
  if (err) {
    return logger.error(err);
  }
  if (!fs.existsSync("storage")) {
    fs.mkdirSync("storage");
  }
  if (!fs.existsSync("logs")) {
    fs.mkdirSync("logs");
  }
  logger.info("Server listen on " + config.get("App.web.port"));
});

process.on("uncaughtException", (err) => {
  logger.fatal(err, "uncaughtException catched");

  server.close(() => {
    process.exit(1);
  });

  setTimeout(() => {
    process.abort();
  }, 2000).unref();

  process.exit(1);
});
