const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.query.token;
  if (!token) return res.status(401).json({ error: "Not authorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user mein companyId aur role bhi attach karo
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ error: "User not found" });

    // Active users hi access kar sakte hain
    if (user.status !== "active") {
      return res.status(403).json({ error: "Account pending approval ya rejected hai." });
    }

    req.user = user;
    req.companyId = decoded.companyId || user.companyId; // JWT ya DB se
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Sirf admin ye kaam kar sakta hai." });
  }
  next();
};

module.exports = { protect, adminOnly };
