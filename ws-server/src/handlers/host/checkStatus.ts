import { config } from "../../config/config.js";
import { hostSockets } from "../../state/hosts.js";
import { pendingStatusChecks } from "../../state/pandingRequests.js";
import { WebSocket } from "ws";
// import { prisma } from "@repo/db/client";


export function handleCheckStatus(socket: WebSocket, machineId: string) {

  const host = hostSockets.find((x) => x.machineId === machineId);
  if (host) {
     socket.send(JSON.stringify({
      type : "SERVER_PONG",
      machineId : machineId,
      status: "online",
    }));  
  } else {
    socket.send(JSON.stringify({
      type : "SERVER_PONG",
      machineId : machineId,
      status: "offline",
    }));  
  }
}

export function handlePong(socket: WebSocket, machineId: string) {

  socket.send(JSON.stringify({
    type: "CHECK_CONFIGURATION",
    command : "cat /sys/fs/cgroup/cpu.max && cat /sys/fs/cgroup/memory.max",
  }));
}

export async function handleFinalPong(socket: WebSocket, machineId: string,success:boolean,output:any){

  if(success){

    const [cpuLine, memoryLine] = output.trim().split("\n");

    const [quota, period] = cpuLine.split(" ").map(Number);

    const formatted = {
      cpu: quota / period,
      memory: {
        RAM: Number(memoryLine) / (1024 * 1024),
      },
    };

    const machineConfig = await fetch(`${config.BASE_API_URL}/get-machine-configuration/${machineId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": config.INTERNAL_SECRET
      },
    });

    if(machineConfig.ok){
      const data = await machineConfig.json();
      if(data.machine.cpu === formatted.cpu && data.machine.ram === formatted.memory.RAM){
        await fetch(`${config.BASE_API_URL}/change-machine-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": config.INTERNAL_SECRET
        },
        body: JSON.stringify({
          machineId: machineId
        })
      });
      hostSockets.push({socket , machineId });
      }else{
        console.error(`Machine ${machineId} configuration mismatch`);
        socket.send(JSON.stringify({
          type: "CONFIGURATION_MISMATCH",
          machineId: machineId
        }));
      }
    }
  }
}