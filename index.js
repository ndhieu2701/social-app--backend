import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

//import routes
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";

// configurations

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

//routes
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);

// connect db & run server
const PORT = process.env.PORT || 6001;
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log("app listening on port: ", PORT));
  })
  .catch((err) => console.log(`${err} did not connect`));
