const multer = require("multer");
const path = require("path");

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error("Only PDF/images allowed"));
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = upload;