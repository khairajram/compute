import { hostSockets } from "../state/hosts.js";
import { WebSocket } from "ws";
// import { prisma } from "@repo/db/client";


export async function registerHost(socket:WebSocket , machineId: string) {

    socket.send(JSON.stringify({
      type: "SERVER_PING"
    }));

}