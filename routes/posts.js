import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  createPost,
  getFeedPosts,
  getUserPosts,
  likePost,
  updatePost,
  deletePost
} from "../controllers/posts.js";

const router = express.Router();

/* READ */
router.get("/", verifyToken, getFeedPosts);
router.get("/:userId/posts", verifyToken, getUserPosts);

/* UPDATE */
router.patch("/:id/like", verifyToken, likePost);
router.put("/:id/update", verifyToken, updatePost)

/* CREATE */
// posts with file
router.post("/", verifyToken, createPost);

/* Delete */
router.delete("/:id/delete", verifyToken, deletePost)
export default router;
