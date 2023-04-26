import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  getCommentByPost,
  getSubComment,
  createComment,
  deleteComment,
  updateComment
} from "../controllers/comment.js";
const router = express.Router();

// read
router.get("/post/:id", verifyToken, getCommentByPost);
router.get("/parent/:id", verifyToken, getSubComment);
// create
router.post("/", verifyToken, createComment);
router.put("/:id", verifyToken, updateComment)
// delete
router.delete("/:id", verifyToken, deleteComment);

export default router;
