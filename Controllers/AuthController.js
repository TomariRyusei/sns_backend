import UserModel from "../Models/UserModel.js";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
  const { username, password, firstname, lastname } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(password, salt);

  const newUser = new UserModel({
    username,
    password: hashedPass,
    firstname,
    lastname,
  });

  try {
    await newUser.save();
    res.status(200).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.findOne({ username: username });

    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      isValid
        ? res.status(200).json(user)
        : res.status(400).json("パスワードが一致しません。");
    } else {
      res.status(404).json("ユーザーが存在しません。");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};