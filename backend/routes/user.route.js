const express = require("express");
const router = express.Router();
const { signup, signin, logout } = require("../controllers/user.controller.js");

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/logout", logout);

module.exports = router;
