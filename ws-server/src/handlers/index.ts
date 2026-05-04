import { handleCheckStatus,handleFinalPong,handlePong } from "./host/checkStatus.js";
import { registerUser } from "../services/userRegistry.js";
import { registerHost } from "../services/hostRegistry.js";
import { WebSocket } from "ws";
import { handleRunJob } from "./client/handleJob.js";
import { handleJobOutput } from "./host/jobResult.js";
import { hostSockets } from "../state/hosts.js";
import { userSockets } from "../state/user.js";
import { config } from "../config/config.js";

export function handleMessage(socket: WebSocket, message: any) {
  try {
    const parsedMessage = JSON.parse(message.toString());

    if (parsedMessage.type === "REGISTER_USER_FOR_MACHINE"){
      const { machineId } = parsedMessage;
      registerUser(socket , machineId);
    }

    if (parsedMessage.type === "REGISTER_HOST"){
      const { machineId } = parsedMessage;
      registerHost(socket , machineId);
    }

    if (parsedMessage.type === "CLIENT_CHECK_STATUS") {
      const { machineId } = parsedMessage;
      return handleCheckStatus(socket, machineId);
    }

    if (parsedMessage.type === "HOST_PONG") {
      const { machineId } = parsedMessage;
      return handlePong(socket, machineId);
    }

    if (parsedMessage.type === "CLIENT_JOB_QUERY") {
      const { machineId,command,sessionId } = parsedMessage;
      return handleRunJob(socket, machineId , command , sessionId);
    }

    if (parsedMessage.type === "HOST_JOB_RESULT"){
      const { machineId,sessionId,success , output, cwd} = parsedMessage;
      return handleJobOutput(socket, machineId , sessionId,success,output,cwd);
    }

    if (parsedMessage.type === "CONFIGURATION_RESULT"){
      const { machineId,success, output} = parsedMessage;
      return handleFinalPong(socket, machineId ,success,output);
    }


    if (parsedMessage.type === "hii"){
      socket.send(JSON.stringify({
        type: "hello",
        message: "hello from server",
      }));
    }

  } catch (err) {
    console.error("Failed to handle message:", err);
  }
}


export async function disconnectHandler(socket: WebSocket) {

  const hostIndex = hostSockets.findIndex((host) => host.socket === socket);
  const userIndex = userSockets.findIndex((user) => user.socket === socket);

  if (hostIndex !== -1) {
    const isHost = hostSockets[hostIndex];
    hostSockets.splice(hostIndex, 1);
    console.log(`Host disconnected: ${isHost?.machineId}`);
    try {
      await fetch(`${config.BASE_API_URL}/change-machine-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": config.INTERNAL_SECRET
        },
        body: JSON.stringify({
          machineId: isHost?.machineId
        })
      });
      console.log(`Updated DB: Machine ${isHost?.machineId} is offline`);
    } catch (e) {
      console.error(`Failed to update DB for machine ${isHost?.machineId}`, e);
    }
  }

  if (userIndex !== -1) {
    const isUser = userSockets[userIndex];
    userSockets.splice(userIndex, 1);
    console.log(`User disconnected: ${isUser?.machineId}`);
  }

  console.log("Client disconnected");
}

export function errorHandler(socket: WebSocket, error: Error) {

  console.error("Socket error:", error);
}