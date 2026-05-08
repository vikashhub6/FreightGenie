const express = require("express");
const router = express.Router();
const { createShipment, getAllShipments, getShipment, searchByPin } = require("../controllers/shipmentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createShipment);
router.get("/", protect, getAllShipments);
router.get("/pin/:pin", protect, searchByPin); // PIN search — must be before /:id
router.get("/:id", protect, getShipment);

module.exports = router;
