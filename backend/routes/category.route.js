const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } = require("../controllers/category.controller");
const verifyOwner = require("../middlewares/ownerAuth");

router.post("/", verifyOwner, upload.single("image"), createCategory);
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.put("/:id", verifyOwner, upload.single("image"), updateCategory);
router.delete("/:id", verifyOwner, deleteCategory);

module.exports = router;
