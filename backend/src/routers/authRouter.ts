import express from "express";
import { signupController } from "../controllers/signupController.js";
import {
  loginController,
  logoutController,
  meController,
} from "../controllers/loginController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/logout", isAuthenticated, logoutController);
router.get("/me", isAuthenticated, meController);

export default router;
