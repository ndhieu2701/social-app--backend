import express from "express";
import {
  getUser,
  getUserFriends,
  addRemoveFriend,
  updateUser,
  searchUser
} from "../controllers/users.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router()

// read
router.get("/:id", verifyToken, getUser)
router.get("/:id/friends", verifyToken, getUserFriends)
router.get("/", verifyToken, searchUser)

// update
router.patch("/friend", verifyToken, addRemoveFriend)
router.put("/:id/update", verifyToken, updateUser)

export default router