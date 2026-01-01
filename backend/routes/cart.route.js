const express = require("express");
const router = express.Router();
const { addToCart, updateCartQuantity, getCart, removeFromCart } = require("../controllers/cart.controller");
const verifyUser = require("../middlewares/auth");

router.use(verifyUser);

router.post("/add", addToCart);
router.get("/", getCart);
router.put("/:id", updateCartQuantity);
router.delete("/remove/:id", removeFromCart);

module.exports = router;
