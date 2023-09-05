const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const BlogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      ref: "User",
    },
    blogTopic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
    },
    content: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    totalLikes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

BlogPostSchema.virtual("topicName", {
  ref: "Topic",
  localField: "blogTopic",
  foreignField: "_id",
  justOne: true,
  select: "name",
});
BlogPostSchema.plugin(mongooseDelete, { deletedAt: true });
BlogPostSchema.plugin(mongooseDelete, { overrideMethods: "all" });

const BlogPostModel = new mongoose.model("BlogPost", BlogPostSchema);

module.exports = BlogPostModel;
