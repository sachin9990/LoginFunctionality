const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

// In order to receive json in req.body
app.use(express.json());
// In order to receive cookies in req.cookie
app.use(cookieParser());

// Listening to a port
app.listen(process.env.PORT, () => {
  console.log(`The server is listening to ${process.env.PORT}`);
});

// Connecting to MongoDB
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_DB_URI, () => {
  console.log(`Connected to MongoDB`);
});

// Routes Import
const userRoutes = require("./Routes/userRoute");
const ErrorHandler = require("./utils/errorHandler");

// Routes
app.use("/api", userRoutes);

// Handle all the errors here
// 1. Make an error class (made in the utils folder errorHandler.js)

app.use((err, req, res, next) => {
  console.log("Error");
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Wrong Mongodb Id error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  //   This gets send in the catch block
  res.status(err.statusCode).json({ success: false, message: err.message });
});
