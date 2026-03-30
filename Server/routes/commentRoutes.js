import express from "express";
import {
    addComment,
    getTaskComments,
} from "../controllers/commentController.js";

const commentRouter = express.Router();

// Add comment
commentRouter.post("/", addComment);

// Get comments for a specific task
commentRouter.get("/:taskId", getTaskComments);

export default commentRouter;