import express from "express";
import {
  createResumeController,
  getResumeController,
  getEachResumeController,
  putResumeController,
  deleteResume,
} from "../controllers/resumeController.js";
import { isCandidate, isRecruiter } from "../middlewares/isRole.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/", isAuthenticated, isCandidate, createResumeController);
router.get("/", isAuthenticated, getResumeController);
router.get("/:userId", isAuthenticated, isRecruiter, getEachResumeController);
router.put("/", isAuthenticated, isCandidate, putResumeController);
router.delete("/", isAuthenticated, isCandidate, deleteResume);

export default router;
