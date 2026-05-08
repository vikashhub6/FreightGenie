const express = require("express");
const router = express.Router();
const { saveEditedDraft, sendEmail, sendMissingDocsAlert } = require("../controllers/emailController");
const { protect } = require("../middleware/authMiddleware");
router.put("/:id/draft", protect, saveEditedDraft);
router.post("/:id/send", protect, sendEmail);
router.post("/:id/missing-alert", protect, sendMissingDocsAlert);
module.exports = router;
