import multer from "multer";

// file storage
const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "public/assets");
  },
  filename: (req, res, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

export default upload;
