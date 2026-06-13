const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "forwarder" },

  company: { type: String },
  // Company email settings — emails to exporters go FROM this
  companyEmail: { type: String },       // e.g. info@abcfreight.com
  companyEmailPassword: { type: String }, // Gmail App Password (stored as-is, not hashed)
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (pass) {
  return bcrypt.compare(pass, this.password);
};

module.exports = mongoose.model("User", userSchema);
