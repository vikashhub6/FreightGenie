const express = require("express");
const router = express.Router();
const {
  getComplianceReport,
  analyzeCompliance,
  approveReport,
  generateEmail,
  generatePDF,
  previewPDF,
  downloadPDF,
} = require("../controllers/complianceController");
const { protect } = require("../middleware/authMiddleware");

router.get("/:id", protect, getComplianceReport);

// ✅ Forwarder manually triggers AI
router.post("/:id/analyze", protect, analyzeCompliance);

// ✅ Forwarder reviews and approves report
router.post("/:id/approve", protect, approveReport);

// Email
router.post("/:id/generate-email", protect, generateEmail);

// PDF
router.post("/:id/generate-pdf", protect, generatePDF);
router.get("/:id/preview-pdf", protect, previewPDF);   // ✅ browser mein preview
router.get("/:id/download-pdf", protect, downloadPDF); // ✅ download karo

module.exports = router;
