import Post from "../models/Post.js";
import User from "../models/User.js";

/* CREATE */
// [POST] /posts : create post
const createPost = async (req, res) => {
  try {
    const { userId, description, picturePath, filePath, fileName, profileId } =
      req.body;
    const user = await User.findById(userId);
    const newPost = await Post.create({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath,
      fileName,
      filePath,
      likes: {},
      comments: [],
    });
    if (profileId) {
      const posts = await Post.find({ userId: profileId }).sort({
        createdAt: -1,
      });
      res.status(201).json(posts);
    } else {
      // find all the post after create new post
      const posts = await Post.find().sort({ createdAt: -1 });
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
    const posts = await Post.find().sort({ createdAt: -1 });
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
    const posts = await Post.find({ userId }).sort({ createdAt: -1 });
    // const postsReverse = posts.reverse();
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
    res.status(200).json(updatedPost);
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
    res.status(200).json(updatedPost);
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
