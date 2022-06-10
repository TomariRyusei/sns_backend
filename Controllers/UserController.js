import UserModel from "../Models/UserModel.js";
import bcrypt from "bcrypt";

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

// ユーザー情報更新
export const updateUser = async (req, res) => {
  const id = req.params.id;
  const { currentUserId, currentUserAdminStatus, password } = req.body;

  if (id === currentUserId || currentUserAdminStatus) {
    try {
      // パスワード変更があればハッシュ化
      if (password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      }

      const user = await UserModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.status(200).json(user);
    } catch (error) {
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

// ユーザーをフォロワーする
export const followUser = async (req, res) => {
  const id = req.params.id;
  const { currentUserId } = req.body;

  if (currentUserId === id) {
    res
      .status(403)
      .json("アクセスが拒否されました。自身をフォロワーすることはできません。");
  } else {
    try {
      const followUser = await UserModel.findById(id);
      const followingUser = await UserModel.findById(currentUserId);

      if (!followUser.followers.includes(currentUserId)) {
        await followUser.updateOne({ $push: { followers: currentUserId } });
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
  const { currentUserId } = req.body;

  if (currentUserId === id) {
    res
      .status(403)
      .json("アクセスが拒否されました。自身をフォロワーすることはできません。");
  } else {
    try {
      const followUser = await UserModel.findById(id);
      const followingUser = await UserModel.findById(currentUserId);

      if (followUser.followers.includes(currentUserId)) {
        await followUser.updateOne({ $pull: { followers: currentUserId } });
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
