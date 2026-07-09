import { v2 as cloudinary } from "cloudinary";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routers/authRouter.js";
import resumeRouter from "./routers/resumeRouter.js";
import profileRouter from "./routers/profileRouter.js";
import errorHandleMiddleware from "./middlewares/errorHandler.js";
import conversationRouter from "./routers/conversationRouter.js";
import { createServer } from "http";
import { initSocket } from "./utils/socket.js";
import { Server } from "socket.io";

dotenv.config();
const app = express();

const server = createServer(app);
export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "resume-builder-eight-lilac.vercel.app",
    credentials: true,
  },
});
initSocket(io);

app.use(express.json());
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "https://resume-builder-eight-lilac.vercel.app",
    credentials: true,
  }),
);
app.use(cookieParser());

const cloud_name = process.env.CLOUD_NAME;
const api_key = process.env.API_KEY;
const api_secret = process.env.API_SECRET;
if (!cloud_name || !api_key || !api_secret) {
  console.log(".env variables missing");
  process.exit(1);
}
cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
});

app.use("/auth", authRouter);
app.use("/resume", resumeRouter);
app.use("/profile", profileRouter);
app.use("/conversation", conversationRouter);

app.use(errorHandleMiddleware);

const PORT = Number(process.env.PORT) || 8000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`App listening on port ${PORT}`),
);
