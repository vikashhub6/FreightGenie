const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },

  // Admin ka email — approval emails yahaan jaate hain
  adminEmail: { type: String },

  // Company email settings — exporters ko yahaan se email jaati hai
  companyEmail: { type: String },
  companyEmailPassword: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Company", companySchema);
