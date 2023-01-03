const JsonWebToken = require("jsonwebtoken");
const userSchema = require("../schemas/userSchema");
const ErrorHandler = require("../utils/errorHandler");
const catchAsynchErrors = require("./catchAsynchErrors");

exports.isUserAuthenticated = catchAsynchErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }
  const decodedData_i_e_ID = JsonWebToken.verify(
    token,
    process.env.JWT_SECRET_KEY
  );

  req.authenticatedUser = await userSchema.findById(decodedData_i_e_ID.idee);

  next();
});
