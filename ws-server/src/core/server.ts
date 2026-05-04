import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import { handleConnection } from "./connection.js";
import { config } from "../config/config.js";

export function startWebSocketServer() {
  const app = express();
  const port = config.PORT;

  const server = http.createServer(app);

  const wss = new WebSocketServer({ server });

  wss.on("connection", handleConnection);

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}