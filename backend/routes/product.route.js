const express = require("express");
const verifyOwner = require("../middlewares/ownerAuth.js");
const upload = require("../middlewares/upload.js");
const { createProducts, getAllProducts, getProductById, updateProduct, deleteProduct } = require("../controllers/product.controller.js");
const router = express.Router();

router.post("/", verifyOwner, upload.single("image"), createProducts);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id", verifyOwner, upload.single("image"), updateProduct);
router.delete("/:id", verifyOwner, deleteProduct);

module.exports = router;
