const express = require("express");
const router = express.Router();

const { registerUser, userLogin } = require("../controllers/userController");

router.route("/user/new").post(registerUser);
router.route("/user/login").post(userLogin);

module.exports = router;
