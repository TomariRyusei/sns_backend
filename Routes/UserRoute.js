import express from "express";

import {
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
  followUser,
  UnFollowUser,
} from "../Controllers/UserController.js";
import authMiddleWare from "../middleware/AuthMiddleware.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", getUser);
router.post("/:id", authMiddleWare, updateUser);
router.delete("/:id", authMiddleWare, deleteUser);
router.put("/:id/follow", authMiddleWare, followUser);
router.put("/:id/unfollow", authMiddleWare, UnFollowUser);

export default router;
