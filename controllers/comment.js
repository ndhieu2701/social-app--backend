import mongoose from "mongoose";
import Comment from "../models/Comment.js";

// [GET] /comments/post/:id
const getCommentByPost = async (req, res) => {
  const { id } = req.params;

  try {
    const comments = await Comment.aggregate([
      {
        $match: {
          post: mongoose.Types.ObjectId(id), // filter comments by post id
        },
      },
      {
        $lookup: {
          from: "comments", // collection to lookup
          localField: "_id",
          foreignField: "parent",
          as: "sub_comments", // field name for sub-comments
        },
      },
      {
        $lookup: {
          from: "users", // collection to lookup
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          user: "$user",
          post: 1,
          content: 1,
          parent: 1,
          subCommentCount: { $size: "$sub_comments" }, // count sub-comments
          createdAt: 1,
        },
      },
    ]).sort({ createdAt: -1 });

    res.json(comments); // return comments as JSON
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};

//[GET] /comments/parent/:id
const getSubComment = async (req, res) => {
  try {
    const { id } = req.params;
    const subComments = await Comment.find({ parent: id }).populate("user");
    res.status(200).json(subComments);
  } catch (error) {
    res.status(404).json(error.message);
  }
};
//[POST] /comments/
const createComment = async (req, res) => {
  try {
    const { user, content, parent, post } = req.body;
    const newComment = await Comment.create({
      user: user,
      content: content,
      parent: parent ? parent : null,
      post: post,
    });
    const response = await newComment.populate("user");
    res.status(200).json(response);
  } catch (error) {
    res.status(404).json(error.message);
  }
};

//[PUT] /comments/:id
const updateComment = async (req, res) => {
  try {
    const { commentID, content } = req.body;
    const newComment = await Comment.findByIdAndUpdate(
      commentID,
      {
        content: content,
      },
      { new: true }
    );
    const commentRes = await newComment.populate("user");
    res.status(200).json(commentRes);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
//[DELETE] /comments/:id
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedComment = await Comment.deleteOne({ _id: id });
    const deleteSubComment = await Comment.deleteMany({ parent: id });
    res.status(200).json("Delete success!");
  } catch (error) {
    res.status(404).json(error.message);
  }
};

export {
  getCommentByPost,
  getSubComment,
  createComment,
  deleteComment,
  updateComment,
};
