const express = require("express");
const router = express.Router();

const {
  registerUser,
  userLogin,
  userLogout,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");

router.route("/user/new").post(registerUser);
router.route("/user/login").post(userLogin);
router.route("/user/logout").get(userLogout);
router.route("/user/forgotPassword").post(forgotPassword);
router.route("/user/password/forgot/:token").post(resetPassword);

module.exports = router;
