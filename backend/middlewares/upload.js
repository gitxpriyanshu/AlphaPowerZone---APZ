const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary.js");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",        // Cloudinary folder
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 4 * 1024 * 1024, // 4MB
  },
});

module.exports = upload;
