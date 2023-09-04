const LikeDislike = require("../models/likeDislikeModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const BlogPostModel = require("../models/blogModel");

// ***************************************LIKE A BLOG***********************************************

const likeBlog = catchAsync(async (req, res, next) => {
  const blogId = req.params.id;
  const { _id: userId } = req.user;

  const likeDislike = await LikeDislike.findOne({ blog: blogId, user: userId });

  if (likeDislike) {
    // User already liked the blog
    if (likeDislike.like) {
      return next(new AppError("You have already liked the blog", 400));
    }

    likeDislike.like = true;
    await likeDislike.save();
    res.status(201).json({
      status: "liked",
      likes: {
        likeDislike,
      },
    });
  } else {
    // User did not like the blog before

    const newLikeDislike = await LikeDislike.create({
      user: userId,
      blog: blogId,
    });

    res.status(201).json({
      status: "liked",
      likes: {
        likeDislike: newLikeDislike,
      },
    });
    const reqblog = await BlogPostModel.findById(blogId);
    reqblog.totalLikes++;
    await reqblog.save();
  }
});

// **************************** DISLIKE A BLOG ***************************************

const dislikeBlog = catchAsync(async (req, res, next) => {
  const blogId = req.params.id;
  const { _id: userId } = req.user;

  const likeDislike = await LikeDislike.findOne({ blog: blogId, user: userId });

  if (likeDislike) {
    // User already disliked the blog

    if (!likeDislike.like) {
      return next(new AppError("You have already disliked the blog", 400));
    }

    likeDislike.like = false;
    await likeDislike.save();
    res.status(201).json({
      status: "disliked",
      likes: {
        likeDislike,
      },
    });
  } else {
    // User did not  dislike the blog before
    const newLikeDislike = await LikeDislike.create({
      user: userId,
      blog: blogId,
      like: false,
    });

    res.status(201).json({
      status: "disliked",
      likes: {
        likeDislike: newLikeDislike,
      },
    });
  }
});

// *********************** GET ALL LIKES **************************

const getAllLikes = catchAsync(async (req, res, next) => {
  const likeDetails = await LikeDislike.find({ like: true })
    .populate({
      path: "user",
      select: "name -_id",
      strictPopulate: false,
    })
    .populate({
      path: "blog",
      select: "title",
      strictPopulate: false,
    });

  res.status(200).json({
    status: "success",
    numberOfLikes: likeDetails.length,
    likeDetails,
  });
});

//************************** GET ALL DISLIKES ************************************

const getAllDislikes = catchAsync(async (req, res, next) => {
  const query = req.query.limit || 1; //for  query
  if (isNaN(query)) return next(new AppError("Query must be a Number"));

  const dislikes = await LikeDislike.find({ like: false })
    .populate({
      path: "user",
      select: "name -_id",
      strictPopulate: false,
    })
    .populate({
      path: "blog",
      select: "title -_id",
      strictPopulate: false,
    });

  res.status(200).json({
    status: "success",
    numberOfDislikes: dislikes.length,
    data: {
      dislikes,
    },
  });
});

module.exports = {
  getAllLikes,
  getAllDislikes,
  likeBlog,
  dislikeBlog,
};
