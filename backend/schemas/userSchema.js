const mongoose = require("mongoose");
const validator = require("validator");
const bCryptJS = require("bcryptjs");
const JWT = require("jsonwebtoken");
// crypto is an inbuilt module of the Node.js
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    maxLength: [30, "Maximum 30 characters allowed"],
    minLength: [3, "Minimum 3 characters allowed"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    // Backend Validation of email using a third party module (validator)
    validate: [validator.isEmail, "Email not valid"],
  },
  password: {
    type: String,
    required: [true, "Please enter you password"],
    minLength: [6, "The Password should be atleast 6 characters"],
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// Hashing the password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bCryptJS.hash(this.password, 10);
});

// Making a function
userSchema.methods.comparePassword = async function (
  userPasswordFromTheFrontEnd
) {
  return await bCryptJS.compare(userPasswordFromTheFrontEnd, this.password);
};

// JWT Token
userSchema.methods.getJwtToken = function () {
  return JWT.sign({ idee: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
  // Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("Users", userSchema);
