import express from "express";
import { exportCSV, exportPDF } from "../controllers/exportController.js";

const exportRouter = express.Router();

exportRouter.get("/:projectId/csv", exportCSV);
exportRouter.get("/:projectId/pdf", exportPDF);

export default exportRouter;
