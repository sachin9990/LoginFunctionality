const catchAsynchErrors = require("../middleWare/catchAsynchErrors");
const userSchema = require("../schemas/userSchema");
const ErrorHandler = require("../utils/errorHandler");

exports.registerUser = catchAsynchErrors(async function (req, res) {
  const userCredentials = req.body;
  const user = await userSchema.create(userCredentials);
  res.status(201).json({ user });
});

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
  const token = user.getJwtToken();
  console.log(token);
  res.status(200).json({ success: true, user });
});
