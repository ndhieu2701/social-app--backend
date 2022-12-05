import Post from "../models/Post.js";
import User from "../models/User.js";

/* CREATE */
// [POST] /posts : create post
const createPost = async (req, res) => {
  try {
    const { userId, description, picturePath } = req.body;
    const user = await User.findById(userId);
    const newPost = await Post.create({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath,
      likes: {},
      comments: [],
    });
    // find all the post after create new post
    const posts = await Post.find();
    res.status(201).json(posts);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

/* READ */
// [GET] /posts : get feed posts
const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// [GET] /posts/:userId/posts : get user posts
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    //find post by userId
    const posts = await Post.find({ userId });
    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json({ message: err.message });
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
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export { createPost, getFeedPosts, getUserPosts, likePost };
