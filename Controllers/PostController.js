import PostModel from "../Models/PostModel.js";
import mongoose from "mongoose";
import UserModel from "../Models/UserModel.js";

export const createPost = async (req, res) => {
  const newPost = new PostModel(req.body);

  try {
    await newPost.save();
    res.status(200).json("新しい投稿が作成されました。");
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;

  try {
    const post = await PostModel.findById(id);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const updatePost = async (req, res) => {
  const postId = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(postId);
    if (post.userId === userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("投稿が更新されました。");
    } else {
      res
        .status(403)
        .json("アクセスが拒否されました。自身の投稿のみ更新できます。");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

export const deletePost = async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(id);
    if (post.userId === userId) {
      await post.deleteOne();
      res.status(200).json("投稿が削除されました。");
    } else {
      res
        .status(403)
        .json("アクセスが拒否されました。自身の投稿のみ削除できます。");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

export const likePost = async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(id);
    if (!post.likes.includes(userId)) {
      await post.updateOne({ $push: { likes: userId } });
      res.status(200).json("いいねしました。");
    } else {
      await post.updateOne({ $pull: { likes: userId } });
      res.status(200).json("いいねを外しました。");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};
