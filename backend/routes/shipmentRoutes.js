const express = require("express");
const router = express.Router();
const { createShipment, getAllShipments, getShipment, searchByPin, downloadBookingPDF, downloadInvoicePDF } = require("../controllers/shipmentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createShipment);
router.get("/", protect, getAllShipments);
router.get("/pin/:pin", protect, searchByPin);
router.get("/:id/download-booking", protect, downloadBookingPDF);
router.get("/:id/download-invoice", protect, downloadInvoicePDF);
router.get("/:id", protect, getShipment);

module.exports = router;
