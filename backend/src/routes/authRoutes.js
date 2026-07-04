const express = require("express");
const AuthController = require("../controllers/authController");
const { loginLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", loginLimiter, AuthController.login);

module.exports = router;
