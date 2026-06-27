import express from "express";
import {
    inviteMember,
    createProjectInvite,
    getInviteInfo,
    acceptProjectInvite,
} from "../controllers/inviteController.js";

const inviteRouter = express.Router();

// Clerk org invite (existing)
inviteRouter.post("/", inviteMember);

// Project invite links
inviteRouter.post("/project/:projectId", createProjectInvite);
inviteRouter.get("/project/:token", getInviteInfo);
inviteRouter.post("/project/accept/:token", acceptProjectInvite);

export default inviteRouter;
