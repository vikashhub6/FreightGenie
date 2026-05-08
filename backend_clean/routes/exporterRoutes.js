const express = require("express");
const router = express.Router();
const { getShipmentByToken, submitExporterDetails } = require("../controllers/exporterController");
router.get("/:token", getShipmentByToken);
router.post("/:token/details", submitExporterDetails);
module.exports = router;
