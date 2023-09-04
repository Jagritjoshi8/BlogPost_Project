const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const bcrypt = require("bcryptjs");

// ***********************SIGN TOKEN****************************

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  let token = signToken(user._id);

  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};

// ********************SIGNING UP USER***********************

const signup = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  const newUser = await User.create({
    name,
    email,
    password,
  });
  createSendToken(newUser, 201, res);
});

// ********************LOGGING IN USER ************************

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("please provide email and password!", 400));
  }

  const user = await User.findOne({ email }).select("+password"); //we use + bcz by default its selection is false in model

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    _id: user._id,
    email,
    token,
  });
});

//******************************** Implementation of jwt ****************************
const protect = catchAsync(async (req, res, next) => {
  //  1)************ Getting token and check if it exits*************
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in please login to get access.", 401)
    );
  }

  // 2)******************verification token************************

  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //console.log(decode);
  // 3)************check if user still exists******************

  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists", 401)
    );
  }
  //***** grant access to protected routes ******
  req.user = currentUser; //putting user data in request
  next();
});

module.exports = {
  signup,
  login,
  protect,
};
