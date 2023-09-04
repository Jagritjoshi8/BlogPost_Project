// this middleware is to validate the id where required

const mongoose = require("mongoose");
const AppError = require("../utils/appError");

const IDvalidation = (req, res, next) => {
  const id = req.params.id;
  if (!id) return next(new AppError("ID not present in parameter", 403));

  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new AppError("Please enter a valid ID", 403));

  next();
};
module.exports = IDvalidation;
