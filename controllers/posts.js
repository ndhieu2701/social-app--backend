import Post from "../models/Post.js";
import User from "../models/User.js";
import mongoose from "mongoose";

/* CREATE */
// [POST] /posts : create post
const createPost = async (req, res) => {
  try {
    const { userId, description, picturePath, filePath, fileName, profileId } =
      req.body;
    const user = await User.findById(userId);
    const newPost = await Post.create({
      user: user._id,
      description,
      picturePath,
      fileName,
      filePath,
      likes: {},
    });
    if (profileId) {
      const posts = await Post.aggregate([
        {
          $match: {
            user: mongoose.Types.ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "post",
            as: "comments",
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
            description: 1,
            picturePath: 1,
            filePath: 1,
            fileName: 1,
            likes: 1,
            commentCount: { $size: "$comments" },
            createdAt: 1,
          },
        },
      ]).sort({ createdAt: -1 });
      res.status(201).json(posts);
    } else {
      // find all the post after create new post
      const posts = await Post.aggregate([
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "post",
            as: "comments",
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
            description: 1,
            picturePath: 1,
            filePath: 1,
            fileName: 1,
            likes: 1,
            commentCount: { $size: "$comments" },
            createdAt: 1,
          },
        },
      ]).sort({ createdAt: -1 });
      res.status(201).json(posts);
    }
  } catch (err) {
    res.status(409).json(err.message);
  }
};

/* READ */
// [GET] /posts : get feed posts
const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.aggregate([
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post",
          as: "comments",
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
          description: 1,
          picturePath: 1,
          filePath: 1,
          fileName: 1,
          likes: 1,
          commentCount: { $size: "$comments" },
          createdAt: 1,
        },
      },
    ]).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json(err.message);
  }
};

// [GET] /posts/:userId/posts : get user posts
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    //find post by userId
    const posts = await Post.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post",
          as: "comments",
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
          description: 1,
          picturePath: 1,
          filePath: 1,
          fileName: 1,
          likes: 1,
          commentCount: { $size: "$comments" },
          createdAt: 1,
        },
      },
    ]).sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json(err.message);
  }
};

/* UPDATE */
// [PATCH] /posts/:id/like : like/unlike post
const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    // post.likes co type = Map => dung method get return post.likes co userId like
    const isLiked = post.likes.get(userId);

    // kiem tra xem co like post chua, true => delete post.likes cua user, false => add new post.likes cua user
    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    // tim kiem Post duoc like va update collection (hieu la database cua Post)
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      // return ban moi thay vi ban goc
      { new: true }
    );
    const newPost = await Post.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post",
          as: "comments",
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
          description: 1,
          picturePath: 1,
          filePath: 1,
          fileName: 1,
          likes: 1,
          commentCount: { $size: "$comments" },
          createdAt: 1,
        },
      },
    ]);
    res.status(200).json(newPost[0]);
  } catch (err) {
    res.status(404).json(err.message);
  }
};
//[PUT] /posts/:id/update : update post
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, fileName, filePath, picturePath } = req.body;
    const post = await Post.findById(id);

    post.description = description;
    post.fileName = fileName;
    post.filePath = filePath;
    post.picturePath = picturePath;

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        description: post.description,
        fileName: post.fileName,
        filePath: post.filePath,
        picturePath: post.picturePath,
      },
      { new: true }
    );
    const newPost = await Post.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post",
          as: "comments",
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
          description: 1,
          picturePath: 1,
          filePath: 1,
          fileName: 1,
          likes: 1,
          commentCount: { $size: "$comments" },
          createdAt: 1,
        },
      },
    ]);
    res.status(200).json(newPost[0]);
  } catch (error) {
    res.status(404).json(error.message);
  }
};
//[DELETE] /posts/:id/delete : delete post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPost = await Post.deleteOne({ _id: id });
    res.status(200).json("Delete success");
  } catch (error) {
    res.status(404).json(error.message);
  }
};
export {
  createPost,
  getFeedPosts,
  getUserPosts,
  likePost,
  updatePost,
  deletePost,
};
