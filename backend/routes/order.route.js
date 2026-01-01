const express = require("express");
const router = express.Router();
const { createOrder, getUserOrders } = require("../controllers/order.controller");
const verifyUser = require("../middlewares/auth");

router.use(verifyUser); // Protect all order routes

router.post("/", createOrder);
router.get("/", getUserOrders);

module.exports = router;
