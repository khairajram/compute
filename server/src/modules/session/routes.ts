import { Router } from "express";
import { changeMachineStatus, getMachineConfiguration } from "./controller.ts";
import { protect, verifyWebSocket } from "../../core/middleware/auth.js";

const router : Router = Router();




//web socket specific routes

router.post("/change-machine-status/",verifyWebSocket, changeMachineStatus);

router.get("/get-machine-configuration/:machineId",verifyWebSocket, getMachineConfiguration);



export default router;