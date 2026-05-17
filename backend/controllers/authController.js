const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.register = async (req, res) => {
  try {
    const { name, email, password, company, companyEmail, companyEmailPassword } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });
    const user = await User.create({ name, email, password, company, companyEmail, companyEmailPassword });
    res.status(201).json({ token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email, company: user.company, companyEmail: user.companyEmail } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, company, companyEmail, companyEmailPassword } = req.body;
    const updateData = { name, company, companyEmail };
    if (companyEmailPassword) updateData.companyEmailPassword = companyEmailPassword;
    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select("-password");
    res.json({ message: "Profile updated!", user: { id: user._id, name: user.name, email: user.email, company: user.company, companyEmail: user.companyEmail } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ error: "Invalid credentials" });
    res.json({ token: generateToken(user._id), user: { id: user._id, name: user.name, email: user.email, company: user.company, companyEmail: user.companyEmail } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};