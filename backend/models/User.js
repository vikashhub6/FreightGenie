const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // ── Company linking ──────────────────────────────────────────
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },

  // role: admin = company ka pehla user / approved karne wala
  //       employee = baad mein join karne wale
  role: { type: String, enum: ["admin", "employee"], default: "employee" },

  // status: pending = admin ne approve nahi kiya
  //         active  = access milega
  //         rejected = admin ne reject kiya
  status: { type: String, enum: ["pending", "active", "rejected"], default: "pending" },

  // Company email settings (admin ke liye — exporters ko yahaan se email jaati hai)
  companyEmail: { type: String },
  companyEmailPassword: { type: String },
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
