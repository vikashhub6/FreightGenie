// routes/authRoutes.js
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateProfile,
  approveUser,
  rejectUser,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
router.post("/register", register);
router.post("/login", login);
router.post("/register", register);
router.post("/login", login);

router.get("/approve-user/:id", approveUser);
router.get("/reject-user/:id", rejectUser);

router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
module.exports = router;


