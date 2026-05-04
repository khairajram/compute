import { Router } from "express";
import { createMachine, getAllMachines, getMachine, getMachinebyId, getSession, startSession, releaseSession, changeMachineStatus, getMachineConfiguration } from "./controller.js";
import { protect, verifyWebSocket } from "../../core/middleware/auth.js";

const router : Router = Router();




router.post("/create",protect, createMachine);

router.get("/getall",protect, getAllMachines);

router.get("/get",protect, getMachine);

router.get("/get/:id",protect, getMachinebyId);
router.post("/start-session/:id",protect, startSession);
router.post("/release-session/:id",protect, releaseSession);
router.get("/get-session",protect, getSession);

//web socket specific routes

router.post("/change-machine-status/",verifyWebSocket, changeMachineStatus);

router.get("/get-machine-configuration/:machineId",verifyWebSocket, getMachineConfiguration);



export default router;