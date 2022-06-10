import express from "express";

import {
  getUser,
  updateUser,
  deleteUser,
  followUser,
  UnFollowUser,
} from "../Controllers/UserController.js";

const router = express.Router();

router.get("/:id", getUser);
router.post("/:id", updateUser);
router.delete("/:id", deleteUser);
router.put("/:id/follow", followUser);
router.put("/:id/unfollow", UnFollowUser);

export default router;
