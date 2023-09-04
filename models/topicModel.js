const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TopicSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    // toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const TopicModel = new mongoose.model("Topic", TopicSchema);

module.exports = TopicModel;
