import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {getAllChat, createChat, createGroupChat} from "../controllers/chat.js"
const router = express.Router();

router.get("/:id", verifyToken, getAllChat)
router.post("/chat", verifyToken, createChat)
router.post("/group", verifyToken, createGroupChat)

export default router