const catchAsynchErrors = require("../middleWare/catchAsynchErrors");
const userSchema = require("../schemas/userSchema");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const sendToken = require("../utils/jwtToken");

// 1. User Register
exports.registerUser = catchAsynchErrors(async function (req, res, next) {
  const userCredentials = req.body;
  const user = await userSchema.create(userCredentials);
  sendToken(user, 201, res);
});
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<(|)>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// 2. User Login
exports.userLogin = catchAsynchErrors(async function (req, res, next) {
  const { email, password } = req.body;
  //   console.log(userCredentials);
  const user = await userSchema.findOne({ email }).select("+password");

  //   Backend validation as the data resides in the backend
  if (!user) {
    return next(new ErrorHandler("Incorrect Credentials", 401));
  }

  const isPasswordSame = await user.comparePassword(password);

  if (!isPasswordSame) {
    return next(new ErrorHandler("Incorrect Credentials", 401));
  }
  //   If everything is good
  //   Provide the user with a JWT Token

  // const token = user.getJwtToken();

  // res
  //   .status(200)
  //   .cookie("token", token, {
  //     expires: new Date(
  //       // expire the cookie in 2 minutes
  //       Date.now() + process.env.COOKIE_EXPIRES_IN * 60 * 1000
  //     ),
  //     httpOnly: true,
  //   })
  //   .json({ success: true, user, token });
  sendToken(user, 200, res);
});
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<(|)>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// 3. User Logout
exports.userLogout = catchAsynchErrors(async function (req, res) {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Logged Out Successfully" });
});

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<(|)>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// 4. Forgot Password
exports.forgotPassword = catchAsynchErrors(async function (req, res, next) {
  // Who is looking for the password, get his/her email id
  const forgotUserEmail = req.body.email;
  // Find the user in the database
  const user = await userSchema.findOne({ email: forgotUserEmail });

  // Check if the user exists
  if (!user) {
    return next(new ErrorHandler("Email not found", 404));
  }

  // Getting a token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  console.log(user);

  const resetPasswordUrl = `http://localhost:3000/user/password/forgot/${resetToken}`;
  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email, then please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Ecommerce Password Recovery",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<(|)>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// 5. Reset Password
exports.resetPassword = catchAsynchErrors(async function (req, res, next) {
  // creating a token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await userSchema.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("Reset Password token in invalid or has expired", 400)
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  //   If everything is good
  //   Provide the user with a JWT Token

  // const token = user.getJwtToken();
  // res
  //   .status(200)
  //   .cookie("token", token, {
  //     expires: new Date(
  //       // expire the cookie in 2 minutes
  //       Date.now() + process.env.COOKIE_EXPIRES_IN * 60 * 1000
  //     ),
  //     httpOnly: true,
  //   })
  //   .json({ success: true, user, token });

  sendToken(user, 200, res);
});
