import User from "../models/User.js";
import bcrypt from "bcrypt";

/* READ */
// [GET] /users/:id : get user
const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json(err.message);
  }
};

// [GET] /users/:id/friends : get user friends
const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    // promise.all() nhan input la cac promise de tao thanh 1 promise duy nhat, tra ve array gom cac thong tin ve cac friend cua user
    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    // lay cac thong tin can thiet cua friend de tra ve client
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json(err.message);
  }
};

//[GET]/users?q=any : search user with query
const searchUser = async (req, res) => {
  try {
    const { q } = req.query;
    const regex = new RegExp(q, "i");
    const users = await User.find({
      $or: [{ firstName: { $regex: regex } }, { lastName: { $regex: regex } }],
    }).select("_id firstName lastName picturePath");
    res.status(200).json(users);
  } catch (error) {
    res.status(404).json(error.message);
  }
};

/* UPDATE */
// [PATCH] /users/:id/:friendId : add or remove friend in friend's list
const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.body;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    // kiem tra xem co friend's id chua, neu co r thi xoa khoi list, chua co thi them vao list
    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((id) => id !== friendId);
      friend.friends = friend.friends.filter((_id) => _id !== id);
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
    }

    // wait user & friend update
    await user.save();
    await friend.save();

    // promise.all() nhan input la cac promise de tao thanh 1 promise duy nhat, tra ve array gom cac thong tin ve cac friend cua user
    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    // lay cac thong tin can thiet cua friend de tra ve client
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json(err.message);
  }
};

//[PUT]/users/:id/update: update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, location, occupation, picturePath, password } =
      req.body;

    const user = await User.findById(id);

    if (password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch)
        return res.status(404).json("password cann't be old password");

      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);
      password = passwordHash;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        firstName,
        lastName,
        location,
        occupation,
        password: password ? password : user.password,
        picturePath: picturePath || user.picturePath,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(404).json(error.message);
  }
};

export { getUser, getUserFriends, addRemoveFriend, updateUser, searchUser };
