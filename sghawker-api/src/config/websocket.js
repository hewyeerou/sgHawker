import { Server } from "socket.io";
import { Logger } from "common";

const DEBUG_ENV = "web socket";

let io;

exports.socketConnection = (server) => {
  io = new Server(server, { /* options */ });
  Logger.info("Setting up web socket...", DEBUG_ENV);
};

exports.emitMessage = (nameSpace, message) => io.emit(nameSpace, message);