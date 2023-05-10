import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import User from "../models/User.js";

//[GET] /chats/:id : get all chat
const getAllChat = async (req, res) => {
  try {
    const { id } = req.params;
    var chats = await Chat.find({ users: id })
      .populate("users", "_id firstName lastName picturePath")
      .populate("latestMessage")
      .populate("groupAdmin", "_id firstName lastName picturePath");
    chats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "firstName lastName picturePath",
    });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

//[POST] /chats/chat : create new chat or get chat
const createChat = async (req, res) => {
  try {
    const { userID } = req.body;
    const adminID = req.user.id;
    // kiem tra xem co ton tai chat chua, neu ton tai thi tra ve chat, khong thi tao 1 chat
    let chat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: adminID } } },
        { users: { $elemMatch: { $eq: userID } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    chat = await User.populate(chat, {
      path: "latestMessage.sender",
      select: "firstName lastName picturePath",
    });
    if (chat.length > 0) return res.status(201).json(chat[0]);
    else {
      const user = await User.findById(userID);
      const newChat = await Chat.create({
        chatName: `${user.firstName} ${user.lastName}`,
        isGroupChat: false,
        users: [adminID, userID],
      });
      const fullChat = await Chat.findById({ _id: newChat._id }).populate(
        "users",
        "-password"
      );
      res.status(201).json(fullChat);
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
};

const createGroupChat = async (req, res) => {
  const users = req.body.users.map((id) => id);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user.id);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user.id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

export { getAllChat, createChat, createGroupChat };
