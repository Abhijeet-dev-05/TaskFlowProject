import express from "express";
import {
    createTask,
    deleteTask,
    updateTask,
} from "../controllers/taskController.js";

const taskRouter = express.Router();

// Create Task
taskRouter.post("/", createTask);

// Update Task
taskRouter.put("/:id", updateTask);

// Delete Task (multiple)
taskRouter.post("/delete", deleteTask);

export default taskRouter;