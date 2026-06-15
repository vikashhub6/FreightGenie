const express = require("express");
const router = express.Router();
const { uploadDocuments, getDocuments } = require("../controllers/documentController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/upload/:token", upload.array("documents", 10), uploadDocuments);
router.get("/:id", protect, getDocuments);

module.exports = router;