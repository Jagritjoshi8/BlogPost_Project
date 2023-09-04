const mongoose = require("mongoose");

const likeDislikeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogPost",
      required: true,
    },
    like: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

likeDislikeSchema.virtual("likeCount", {
  ref: "LikeDislike",
  localField: "blog",
  foreignField: "blog",
  count: true,
  match: { like: true },
});

const LikeDislike = new mongoose.model("LikeDislike", likeDislikeSchema);

module.exports = LikeDislike;
