const express = require("express");
const router = express.Router();
const { signin, logout } = require("../controllers/owner.controller.js");

router.post("/signin", signin);
router.post("/logout", logout);

module.exports = router;
