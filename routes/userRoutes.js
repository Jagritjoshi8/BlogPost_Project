const express = require("express");
const userController = require("../Controllers/userController");
const authController = require("../Controllers/authController");
const detailValidation = require("../Middleware/detailValidation");
const router = express.Router();

router.post("/signup", detailValidation, authController.signup);
router.post("/login", authController.login);
router.route("/").get(authController.protect, userController.getAllUsers);

module.exports = router;
