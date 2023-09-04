const TopicModel = require("../models/topicModel");
const topicModel = require("../models/topicModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

//********************************** CREATE TOPIC **********************************

const createTopic = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;

  if (!name || !description)
    return next(new AppError("Name and description are neccessary field", 400));

  const topic = new topicModel({
    name,
    description,
    user: req.user.id,
  });
  await topic.save();
  res.status(201).json(topic);
});

//*************************************** GET ALL TOPICS ***************************************/

const getAllTopics = catchAsync(async (req, res, next) => {
  const topics = await topicModel.find();
  res.status(200).json({
    numberOfTopics: topics.length,
    topics,
  });
});

//************************************** DELETE TOPIC *************************************/
const deleteTopicById = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const topic = await TopicModel.findById(id);
  if (req.user.id !== topic.user.toString()) {
    return next(
      new AppError("You are not authorized to delete this post", 401)
    );
  }
  const deltopic = await TopicModel.deleteOne(topic);
  // const topic = await TopicModel.deleteMany();

  if (deltopic) {
    res.status(201).json({
      msg: "Topic Deleted Successfully",
    });
  } else {
    return next(new AppError("Something went wrong", 500));
  }
});

module.exports = {
  createTopic,
  getAllTopics,
  deleteTopicById,
};
