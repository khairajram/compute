import { hostSockets } from "../state/hosts.js";
import { userSockets } from "../state/user.js";
import { WebSocket } from "ws";



export function registerUser(socket:WebSocket , machineId: string) {
    const exist = userSockets.find((x) => x.machineId === machineId);
    const machineExists = hostSockets.find((x) => x.machineId === machineId);
    if(exist){
        socket.send(JSON.stringify({
            type: "REGISTER_USER_FOR_MACHINE",
            success: false,
            machineId: machineId,
            message: "Machine already allocated to other user"
        }));
        return;
    }
    if(!machineExists){
        socket.send(JSON.stringify({
            type: "REGISTER_USER_FOR_MACHINE",
            success: false,
            machineId: machineId,
            message: `machine ${machineId} is not registered or offline`
        }));
        return;
    }
    userSockets.push({socket , machineId });
    socket.send(JSON.stringify({
        type: "REGISTER_USER_FOR_MACHINE",
        success: true,
        machineId: machineId,
        message: "user registered successfully"
    }));
}