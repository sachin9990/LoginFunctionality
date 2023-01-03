const express = require("express");
const router = express.Router();

const {
  registerUser,
  userLogin,
  userLogout,
  forgotPassword,
  resetPassword,
  updateName,
  updatePassword,
} = require("../controllers/userController");
const { isUserAuthenticated } = require("../middleWare/authentication");

router.route("/user/new").post(registerUser);
router.route("/user/login").post(userLogin);
router.route("/user/logout").get(userLogout);
router.route("/user/forgotPassword").post(forgotPassword);
router.route("/user/password/forgot/:token").post(resetPassword);
router.route("/user/update/name").put(isUserAuthenticated, updateName);
router.route("/user/update/password").put(isUserAuthenticated, updatePassword);

module.exports = router;
