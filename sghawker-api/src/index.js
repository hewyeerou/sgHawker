import express from "express";
import Promise from "bluebird";

import { Logger } from "common";
import environment from "./config/environment";
import database from "./config/database";
import routes from "./config/routes";
import settings from "./config/settings";
import scheduler from "./helpers/scheduler";
import session from "./config/session";
const { socketConnection } = require("./config/websocket");

const DEBUG_ENV = "server";
const app = express();

const promise = Promise.resolve()
  .then(() => {
    Logger.info(`Node Environment: ${process.env.NODE_ENV}`, DEBUG_ENV);
    Logger.info("Setting up environment...", DEBUG_ENV);
    return environment(app);
  })
  .then(() => {
    Logger.info("Setting up session...", DEBUG_ENV);
    return session(app);
  })
  .then(() => {
    Logger.info("Settings up database...", DEBUG_ENV);
    return database(app);
  })
  .then(() => {
    Logger.info("Setting up routes...", DEBUG_ENV);
    return routes(app);
  })
  .then(() => {
    app.set("port", settings.PORT);
    const server = app.listen(
      settings.PORT,
      process.env.NODE_ENV === "production" ? "0.0.0.0" : null
    );
    Logger.info(`HTTP Server Started at port ${settings.PORT}`, DEBUG_ENV);
    return socketConnection(server);
  })
  .then(() => {
    scheduler.start();
    Logger.info("Scheduler started...", DEBUG_ENV);
  })
  .catch((err) => {
    Logger.error(err.stack, DEBUG_ENV);
    process.kill(process.pid, "SIGKILL");
  });

export default promise;
