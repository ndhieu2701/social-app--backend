import express from "express";
import { login, register } from "../controllers/auth.js";
import upload from "../middleware/upload.js"

const router = express.Router();
// register with file
router.post("/register", upload.single("picture"), register)
//login
router.post("/login", login);

export default router;
