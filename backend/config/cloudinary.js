const cloudinary = require("cloudinary").v2;

console.log("Initializing Cloudinary with Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME ? "PRESENT" : "MISSING");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
