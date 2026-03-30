import express from "express";
import { inviteMember } from "../controllers/inviteController.js";

const inviteRouter = express.Router();

inviteRouter.post("/", inviteMember);

export default inviteRouter;
