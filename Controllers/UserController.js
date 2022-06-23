import UserModel from "../Models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ユーザー情報取得
export const getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await UserModel.findById(id);
    if (user) {
      const { password, ...otherDetails } = user._doc;
      res.status(200).json(otherDetails);
    } else {
      res.status(404).json("ユーザーが存在しません。");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// 全ユーザー情報取得
export const getAllUsers = async (req, res) => {
  try {
    let users = await UserModel.find();
    users = users.map((user) => {
      const { password, ...otherDetails } = user._doc;
      return otherDetails;
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
};

// ユーザー情報更新
export const updateUser = async (req, res) => {
  const id = req.params.id;
  const { _id, currentUserAdminStatus, password } = req.body;

  if (id === _id || currentUserAdminStatus) {
    try {
      // パスワード変更があればハッシュ化
      if (password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      }

      const user = await UserModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      const token = jwt.sign(
        { username: user.username, id: user._id },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );

      res.status(200).json({ user, token });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  } else {
    res
      .status(403)
      .json(
        "アクセスが拒否されました。ご自身のアカウント情報のみ更新可能です。"
      );
  }
};

// ユーザー情報削除
export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const { currentUserId, currentUserAdminStatus } = req.body;
  if (id === currentUserId || currentUserAdminStatus) {
    try {
      await UserModel.findByIdAndDelete(id);
      res.status(200).json("ユーザーが削除されました。");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res
      .status(403)
      .json("アクセスが拒否されました。ご自身のアカウントのみ削除可能です。");
  }
};

// ユーザーをフォローする
export const followUser = async (req, res) => {
  const id = req.params.id;
  const { _id } = req.body;

  if (_id === id) {
    res
      .status(403)
      .json("アクセスが拒否されました。自身をフォロワーすることはできません。");
  } else {
    try {
      const followUser = await UserModel.findById(id);
      const followingUser = await UserModel.findById(_id);

      if (!followUser.followers.includes(_id)) {
        await followUser.updateOne({ $push: { followers: _id } });
        await followingUser.updateOne({ $push: { followings: id } });
        res.status(200).json("ユーザーをフォロワーしました。");
      } else {
        res
          .status(403)
          .json(
            "アクセスが拒否されました。すでにこのユーザーをフォロワーしています。"
          );
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
};

// フォロワーを解除する
export const UnFollowUser = async (req, res) => {
  const id = req.params.id;
  const { _id } = req.body;

  if (_id === id) {
    res
      .status(403)
      .json("アクセスが拒否されました。自身をフォロワーすることはできません。");
  } else {
    try {
      const followUser = await UserModel.findById(id);
      const followingUser = await UserModel.findById(_id);

      if (followUser.followers.includes(_id)) {
        await followUser.updateOne({ $pull: { followers: _id } });
        await followingUser.updateOne({ $pull: { followings: id } });
        res.status(200).json("フォローを解除しました。");
      } else {
        res
          .status(403)
          .json(
            "アクセスが拒否されました。このユーザーをフォロワーしていません。"
          );
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
};
