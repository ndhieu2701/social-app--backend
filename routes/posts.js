import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  createPost,
  getFeedPosts,
  getUserPosts,
  likePost,
} from "../controllers/posts.js";

const router = express.Router();

/* READ */
router.get("/", verifyToken, getFeedPosts);
router.get("/:userId/posts", verifyToken, getUserPosts);

/* UPDATE */
router.patch("/:id/like", verifyToken, likePost);

/* CREATE */
// posts with file
router.post("/", verifyToken, createPost);

export default router;
