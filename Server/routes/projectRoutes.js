import express from "express";
import {
    addMember,
    createProject,
    updateProject,
} from "../controllers/projectController.js";

const projectRouter = express.Router();

// Create Project
projectRouter.post("/", createProject);

// Update Project
projectRouter.put("/", updateProject);

// Add Member to Project
projectRouter.post("/:projectId/addMember", addMember);

export default projectRouter;