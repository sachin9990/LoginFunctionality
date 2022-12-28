// Create Token and saving in cookie

const sendToken = (user, statusCode, res) => {
  const token = user.getJwtToken();

  // options for cookie
  const options = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_IN * 60 * 1000),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};

module.exports = sendToken;
