// this middleware is to validate the details for BlogPost which are going to be filled

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const TopicModel = require("../models/topicModel");
const BlogPostModel = require("../models/blogModel");

const blogDetailValidation = catchAsync(async (req, res, next) => {
  const { title, author, content, blogTopic } = req.body;

  let missingValues = [];

  if (!title) missingValues.push("Title ");
  if (!author) missingValues.push("Author ");
  if (!content) missingValues.push("Content ");
  if (!blogTopic) missingValues.push("blogTopic ");

  if (missingValues.length > 0) {
    return next(
      new AppError(
        `required missing values : ${missingValues} is neccessary to be filled`,
        400
      )
    );
  }

  const blogName = await BlogPostModel.find({ title });
  // console.log(blogName);
  if (blogName.length > 0)
    return next(new AppError("Blog title must be unique", 403));

  const topicName = await TopicModel.findById(blogTopic);
  //console.log(topicName);
  if (!topicName)
    return next(
      new AppError(
        "Topic Category does not exist, Select from given Topics",
        403
      )
    );

  next();
});

module.exports = blogDetailValidation;
