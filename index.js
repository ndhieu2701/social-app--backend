import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
// import path from "path";
// import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

// import data test
// import User from "./models/User.js";
// import Post from "./models/Post.js";
// import { users, posts } from "./data/index.js";

// import routes
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import postsRoutes from "./routes/posts.js";
import commentsRoutes from "./routes/comment.js";
import chatsRouters from "./routes/chat.js";
import messageRouter from "./routes/message.js";
import { log } from "console";

// configurations
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
// app.use("/assets", express.static(path.join(__dirname, "public/assets")));

//routes
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/posts", postsRoutes);
app.use("/comments", commentsRoutes);
app.use("/chats", chatsRouters);
app.use("/message", messageRouter);

// connect db & run server
const PORT = process.env.PORT || 3001;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => console.log("app listening on port: ", PORT));
    // add data one time
    // User.insertMany(users)
    // Post.insertMany(posts)
  })
  .catch((err) => console.log(`${err} did not connect`));

//bat socket.io
io.on("connection", (socket) => {
  console.log("connect soket io");
  // event 'setup' => callback function
  socket.on("setup", (userData) => {
    //tao 1 room cho user co user._id trong userData
    socket.join(userData._id);
    // sending to all people in userData listening to event "connected"
    socket.emit("connected");
  });

  //tao room theo id chat
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user join room: " + room);
  });

  //typing, stop typing
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  // get new message
  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    console.log(newMessageRecieved);
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
