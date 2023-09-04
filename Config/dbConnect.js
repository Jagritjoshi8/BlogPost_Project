const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const dbConnect = catchAsync(async (req, res, next) => {
  const connect = await mongoose.connect(process.env.DB_CONNECT);

  console.log(
    "Database Connected: ",
    connect.connection.host,
    connect.connection.name
  );
});

module.exports = dbConnect;
