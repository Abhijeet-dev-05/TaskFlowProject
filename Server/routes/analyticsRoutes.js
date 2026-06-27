import express from "express";
import { getWorkloadAnalytics } from "../controllers/analyticsController.js";

const analyticsRouter = express.Router();

// Workload Analytics
analyticsRouter.get("/workload/:workspaceId", getWorkloadAnalytics);

export default analyticsRouter;
