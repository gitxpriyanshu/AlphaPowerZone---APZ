const express = require("express");
const verifyOwner = require("../middlewares/ownerAuth.js");
const upload = require("../middlewares/upload.js");
const { createProducts, getAllProducts, getProductById, updateProduct, deleteProduct } = require("../controllers/product.controller.js");
const router = express.Router();

router.post("/products", verifyOwner, upload.single("image"), createProducts);
router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.put("/products/:id", verifyOwner, upload.single("image"), updateProduct);
router.delete("/products/:id", verifyOwner, deleteProduct);

module.exports = router;
