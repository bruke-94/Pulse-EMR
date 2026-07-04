const express = require("express");
const { authenticate } = require("../middleware/auth");
const UserController = require("../controllers/userController");

const router = express.Router();

router.use(authenticate);
router.get("/doctors", UserController.listDoctors);

module.exports = router;
