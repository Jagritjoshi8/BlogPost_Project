const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/appError");

// ************************* GET ALL USERS *****************************

const getAllUsers = catchAsync(async (req, res, next) => {
  let query = User.find();

  const totalUsers = await User.countDocuments();

  if (req.query.limit) {
    const limit = parseInt(req.query.limit);
    if (limit > totalUsers) {
      return next(
        new AppError(
          "Requested limit is greater than the total number of users",
          400
        )
      );
    }
    query = query.limit(limit);
  }

  const users = await query;

  res.status(200).json({
    numberOfUsers: users.length,
    users,
  });
});

module.exports = {
  getAllUsers,
};
