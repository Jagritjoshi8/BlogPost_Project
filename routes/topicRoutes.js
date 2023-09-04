const express = require("express");
const router = express.Router();
const topicController = require("../Controllers/topicController");
const authController = require("../Controllers/authController");
const IDvalidation = require("../Middleware/IDvalidation");

//  **************************** GET ALL TOPICS ************************

router.get("/getAllTopics", topicController.getAllTopics);

// ****************************** CREATE TOPICS **************************

router.post(
  "/createTopic",
  authController.protect,
  topicController.createTopic
);
// ****************************** DELETE TOPICS **************************

router.delete(
  "/:id",
  authController.protect,
  IDvalidation,
  topicController.deleteTopicById
);

module.exports = router;
