import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import generateToken from "../config/generateToken.js";
import User from "../models/User.js";

//[POST] /auth/register : register
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends,
      location,
      occupation,
    } = req.body;

    // hash password
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    //create new user to User collection
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath,
      friends,
      location,
      occupation,
      viewedProfile: 0,
      impressions: 0,
    });

    //response to client
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// [POST] /auth/login : login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    /* VALIDATE LOGIN */
    //check user exist or not
    if (!user) return res.status(400).json({ msg: "User does not exist!" });

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

    //delete password in user and response to client
    delete user.password;
    res.status(200).json({ token: generateToken(user._id), user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
