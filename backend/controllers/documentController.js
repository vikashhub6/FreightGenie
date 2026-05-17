const pdfParse = require("pdf-parse");
const Shipment = require("../models/Shipment");
const Notification = require("../models/Notification");
const { generatePDFReport } = require("../services/pdfService");
const cloudinary = require("../config/cloudinary");
const path = require("path");

const DOC_TYPES = {
  invoice: ["invoice", "commercial"],
  packing_list: ["packing", "packing list"],
  certificate: ["certificate", "cert", "origin", "health"],
};

function detectDocType(filename) {
  const lower = filename.toLowerCase();
  for (const [type, keywords] of Object.entries(DOC_TYPES)) {
    if (keywords.some((k) => lower.includes(k))) return type;
  }
  return "other";
}

async function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "shipchain/documents",
        resource_type: "auto",
        type: "upload",
        access_mode: "public",
        public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(file.buffer);
  });
}

// Exporter uploads docs → Cloudinary pe save, AI AUTO NAHI CHALEGA
exports.uploadDocuments = async (req, res) => {
  const io = req.app.get("io");
  const emitToForwarder = req.app.get("emitToForwarder");
  const { token } = req.params;

  try {
    const shipment = await Shipment.findOne({ accessToken: token });
    if (!shipment) return res.status(404).json({ error: "Invalid link" });
    if (!req.files?.length) return res.status(400).json({ error: "No files uploaded" });

    // Upload to Cloudinary
    const uploadedDocs = [];
    for (const file of req.files) {
      const result = await uploadToCloudinary(file);
      uploadedDocs.push({
        name: result.public_id,
        originalName: file.originalname,
        cloudinaryUrl: result.secure_url,
        cloudinaryPublicId: result.public_id,
        resourceType: result.resource_type,
        type: detectDocType(file.originalname),
      });
    }

    shipment.documents.push(...uploadedDocs);
    shipment.status = "docs_uploaded";
    shipment.statusHistory.push({
      status: "docs_uploaded",
      message: `${req.files.length} document(s) uploaded by exporter`,
    });
    await shipment.save();

    // Notify forwarder
    const notification = await Notification.create({
      forwarderId: shipment.forwarderId,
      shipmentId: shipment._id,
      type: "docs_uploaded",
      message: `${shipment.exporterName || shipment.exporterEmail} ne ${req.files.length} document(s) upload kiye for "${shipment.product}" — Click to analyze.`,
    });

    emitToForwarder(shipment.forwarderId.toString(), "new-notification", {
      notification,
      shipmentId: shipment._id,
    });

    io.to(shipment._id.toString()).emit("status", {
      status: "docs_uploaded",
      message: "Documents uploaded successfully! Forwarder will review and analyze.",
    });

    res.json({ message: "Documents uploaded successfully!", count: req.files.length });
    // ✅ AI YAHAN NAHI CHALEGA — forwarder manually trigger karega
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ _id: req.params.id, forwarderId: req.user._id });
    if (!shipment) return res.status(404).json({ error: "Not found" });
    res.json(shipment.documents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
