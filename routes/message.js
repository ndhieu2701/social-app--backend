import express from "express";
import { createMessage, getMessages } from "../controllers/message.js";
import { verifyToken } from "../middleware/auth.js";
const router = express.Router();

router.get("/:id", verifyToken, getMessages);
router.post("/", verifyToken, createMessage);
export default router;
