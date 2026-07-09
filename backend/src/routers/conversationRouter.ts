import express from "express";
import {
  postConversation,
  getConversation,
  getEachConversation,
} from "../controllers/conversationController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isRecruiter } from "../middlewares/isRole.js";

const router = express.Router();

router.post("/", isAuthenticated, isRecruiter, postConversation);
router.get("/", isAuthenticated, getConversation);
router.get("/:id/messages", isAuthenticated, getEachConversation);

export default router;
