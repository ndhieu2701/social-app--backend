import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const createMessage = async (req, res) => {
  try {
    const { content, chatID } = req.body;
    const sender = req.user.id;
    var newMessage = await Message.create({
      sender,
      content,
      chat: chatID,
    });
    newMessage = await newMessage.populate({
      path: "sender",
      select: "firstName lastName picturePath",
    });

    newMessage = await newMessage.populate("chat");
    newMessage = await User.populate(newMessage, {
      path: "chat.users",
      select: "firstName lastName picturePath",
    });

    await Chat.findByIdAndUpdate(chatID, { latestMessage: newMessage });
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await Message.find({ chat: id })
      .populate("sender", "firstName lastName picturePath _id")
      .populate("chat");
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

export { createMessage, getMessages };
