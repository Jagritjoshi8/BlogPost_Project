const BlogPostModel = require("../models/blogModel");
const mongoose = require("mongoose");
const catchAsync = require("express-async-handler");
const AppError = require("../utils/appError");
const TopicModel = require("../models/topicModel");
const Comment = require("../models/commentModel");
const LikeDislike = require("../models/likeDislikeModel");

//******************************CREATE A NEW BLOGPOST******************************

const createBlogPost = catchAsync(
  async (req, res, next) => {
    const { title, author, content, blogTopic } = req.body;

    const topic = await TopicModel.findById(blogTopic);

    const topicName = topic.name;

    const blogPost = await BlogPostModel.create({
      title,
      author,
      blogTopic,
      content,
      user: req.user.id,
    });

    res.status(201).json({
      _id: blogPost._id,
      title,
      author,
      blogTopicID: topic._id,
      blogTopic: topicName,
      content,
      user: req.user.id,
    });
  },
  (error) => {
    res.status(500).json({ error: "Failed to create blog post" });
  }
);

//***************************** GET ALL BLOGPOSTS ************************************
const getAllBlogPosts = catchAsync(async (req, res, next) => {
  const blogPosts = await BlogPostModel.find()
    .populate("blogTopic", "name")
    .lean();
  res.status(200).json({
    numberOfBlogs: blogPosts.length,
    blogPosts,
  });
});
// **************************** GET A BLOGPOST BY ID ********************************
const getBlogPostById = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const blogPost = await BlogPostModel.findById(id)
    .populate("blogTopic", "name")
    .lean();

  if (!blogPost) {
    res.status(404).json({ message: "Blog post not found" });
  } else {
    res.status(200).json(blogPost);
  }
});

// *************************** UPDATE A BLOGPOST ***********************************

const updateBlogPostById = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const { title, author, content, blogTopic } = req.body;

  // pattern not match error handling

  const titleRegex = /^[a-zA-Z0-9\s]*$/;
  if (!titleRegex.test(req.body.title)) {
    return res.status(400).json({
      error: "Title should only contain alphanumeric characters and spaces",
    });
  }

  const blogPost = await BlogPostModel.findById(id).populate(
    "blogTopic",
    "name"
  );

  if (!blogPost) {
    return next(new AppError("Blog not found", 404));
  }

  if (req.user.id !== blogPost.user.toString()) {
    return next(
      new AppError("You are not authorized to update this post", 401)
    );
  }

  const topic = await TopicModel.findById(blogTopic);
  if (!topic) return next(new AppError("Blog Topic does not exist", 403));

  const updated = await BlogPostModel.findByIdAndUpdate(
    id,
    { title, author, content, blogTopic: topic._id },
    {
      new: true,
      populate: {
        path: "topicName",
        select: "name -_id",
      },
    }
  );

  const temp = [
    {
      ...updated.toJSON(),
      topic: updated.topicName,
    },
  ];
  // console.log(temp);

  const updatedBlog = temp.map((blog) => {
    const { blogTopic, topic, ...rest } = blog;
    return {
      ...rest,
      blogTopic: topic.name,
    };
  });

  if (updated) {
    res.status(201).json({
      msg: "Blog Updated Successfully",
      updatedBlog,
    });
  } else {
    return next(new AppError("Something went wrong", 500));
  }
});

//***************************** DELETE A BLOGPOST ***********************************

const deleteBlogPostById = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  if (!id) return next(new AppError("ID is not present in parameter", 403));

  const blogPost = await BlogPostModel.findById(id);

  if (!blogPost) {
    return next(new AppError("Blog not found", 404));
  }

  if (req.user.id !== blogPost.user.toString()) {
    return next(
      new AppError("You are not authorized to delete this post", 401)
    );
  }
  await LikeDislike.deleteMany({ blog: id });
  await Comment.deleteMany({ blog: id });
  const deleted = await BlogPostModel.findByIdAndDelete(id);
  if (deleted) {
    res.status(201).json({
      msg: "Blog Deleted Successfully",
    });
  } else {
    return next(new AppError("Something went wrong", 500));
  }
});

// ************************** GET POSTS BY TOPIC ********************************

const getPostsByTopic = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  // if (!id) return next(new AppError("ID is not present in parameter", 403));

  const posts = await BlogPostModel.find({ blogTopic: id })
    .populate("blogTopic", "name")
    .lean();
  if (!posts || posts.length === 0)
    return next(new AppError("Blog Not Found For Requested Topic", 404));

  res.status(200).json({
    status: "Success",
    TopicCategory: posts[0].blogTopic.name,
    numberOfBlogs: posts.length,
    posts,
  });
});

//************************** GET MOST RECENT BLOGPOST **************************

const getMostRecentBlogPost = catchAsync(async (req, res, next) => {
  let query = req.query.limit || null; // for query
  if (query && isNaN(query))
    return next(new AppError("Query must be a Number"));

  const queryOptions = {};

  if (query) {
    const blogCount = await BlogPostModel.countDocuments();
    if (+query > blogCount) {
      return next(
        new AppError(
          "Limit exceeds number of available recent blog posts.",
          400
        )
      );
    }

    queryOptions.limit = +query;
  }

  const mostRecentBlog = await BlogPostModel.find()
    .sort({ createdAt: -1 })
    .populate("blogTopic", "name")
    .lean()
    .setOptions(queryOptions);

  if (mostRecentBlog.length === 0) {
    return next(new AppError("Blog Not Found", 400));
  }

  res.status(200).json(mostRecentBlog);
});

// ************************ GET MOST LIKED BLOGS *************************

const getMostLikedBlog = catchAsync(async (req, res, next) => {
  const temp = await LikeDislike.aggregate([
    {
      $match: {
        like: true,
      },
    },
    {
      $group: {
        _id: "$blog",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $lookup: {
        from: "blogposts",
        localField: "_id",
        foreignField: "_id",
        as: "blog",
      },
    },
    {
      $unwind: "$blog",
    },
    {
      $project: {
        _id: "$blog._id",
        total_likes: "$count",
        title: "$blog.title",
        content: "$blog.content",
      },
    },
  ]);
  //console.log(temp);
  if (temp.length === 0) {
    return next(new AppError("No liked blog posts yet", 404));
  }

  // const maxLikes = temp[0].total_likes;
  // const mostLikedBlogs = temp.filter(
  //   (blogposts) => blogposts.total_likes === maxLikes
  // );

  res.json({
    output: temp[0],
  });
});

module.exports = {
  createBlogPost,
  updateBlogPostById,
  deleteBlogPostById,
  getAllBlogPosts,
  getBlogPostById,
  getPostsByTopic,
  getMostLikedBlog,
  getMostRecentBlogPost,
};
