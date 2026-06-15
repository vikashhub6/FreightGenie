const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Company = require("../models/Company");

// ── JWT generate ─────────────────────────────────────────────────────────────
const generateToken = (userId, companyId, role) =>
  jwt.sign({ id: userId, companyId, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ── Approval email to admin ───────────────────────────────────────────────────


async function sendApprovalRequestEmail(
adminEmail,
employeeName,
employeeEmail,
companyName,
userId
) {
try {
const transporter = nodemailer.createTransport({
service: "gmail",
auth: {
user: process.env.SMTP_USER,
pass: process.env.SMTP_PASS,
},
});


const approveUrl =
  `${process.env.BACKEND_URL}/api/auth/approve-user/${userId}`;

const rejectUrl =
  `${process.env.BACKEND_URL}/api/auth/reject-user/${userId}`;

await transporter.sendMail({
  from: `"FreightGenie" <${process.env.SMTP_USER}>`,
  to: adminEmail,
  subject: `🔔 New Employee Approval Request — ${companyName}`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
      
      <h2 style="color:#2563eb;">
        👤 New Employee Join Request
      </h2>

      <p>
        A new user wants to join your company on FreightGenie:
      </p>

      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr style="background:#f1f5f9;">
          <td style="padding:10px;font-weight:bold;">Name</td>
          <td style="padding:10px;">${employeeName}</td>
        </tr>

        <tr>
          <td style="padding:10px;font-weight:bold;">Email</td>
          <td style="padding:10px;">${employeeEmail}</td>
        </tr>

        <tr style="background:#f1f5f9;">
          <td style="padding:10px;font-weight:bold;">Company</td>
          <td style="padding:10px;">${companyName}</td>
        </tr>
      </table>

      <div style="margin-top:20px;text-align:center;">

        <a href="${approveUrl}"
           style="background:#16a34a;color:white;padding:12px 20px;text-decoration:none;border-radius:6px;display:inline-block;margin-right:10px;">
          ✅ Approve
        </a>

        <a href="${rejectUrl}"
           style="background:#dc2626;color:white;padding:12px 20px;text-decoration:none;border-radius:6px;display:inline-block;">
          ❌ Reject
        </a>

      </div>

      <p style="margin-top:25px;color:#64748b;font-size:12px;">
        FreightGenie Automated Approval System
      </p>

    </div>
  `,
});

console.log("Approval email sent to admin:", adminEmail);


} catch (error) {
console.error("Email error:", error);
}
}



// ── REGISTER ─────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, companyName, companyEmail, companyEmailPassword } = req.body;

    // Email already registered?
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });

    // Company dhundo ya banao
    let company = await Company.findOne({ name: companyName.trim() });
    let isFirstUser = false;

    if (!company) {
      // ── Nayi company — pehla user = ADMIN ──────────────────────────────────
      isFirstUser = true;
      company = await Company.create({
        name: companyName.trim(),
        companyEmail: companyEmail || "",
        companyEmailPassword: companyEmailPassword || "",
      });
    }

    // User banao
    const user = await User.create({
      name,
      email,
      password,
      companyId: company._id,
      role: isFirstUser ? "admin" : "employee",
      status: isFirstUser ? "active" : "pending",
      companyEmail: isFirstUser ? (companyEmail || "") : "",
      companyEmailPassword: isFirstUser ? (companyEmailPassword || "") : "",
    });

    // Agar pehla user hai to company ka adminEmail save karo
    if (isFirstUser) {
      company.adminEmail = email;
      await company.save();
    }

    // Agar employee hai — admin ko approval email bhejo
    if (!isFirstUser) {
      const admin = await User.findOne({ companyId: company._id, role: "admin" });
      if (admin?.email) {
        await sendApprovalRequestEmail(admin.email, name, email, company.name,user._id);
      }
      return res.status(201).json({
        pending: true,
        message: "Registration successful! Admin approval ka wait karo.",
      });
    }

    // Admin — seedha token aur login
    const token = generateToken(user._id, company._id, user.role);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        companyId: company._id,
        companyName: company.name,
        companyEmail: user.companyEmail,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate("companyId", "name companyEmail");
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ error: "Invalid credentials" });

    // Pending user — login allow karo but pending flag bhejo
    if (user.status === "pending") {
      return res.status(200).json({
        pending: true,
        message: "Tumhara account abhi admin approval ke liye pending hai.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          companyName: user.companyId?.name,
        },
      });
    }

    // Rejected user
    if (user.status === "rejected") {
      return res.status(403).json({ error: "Tumhari request admin ne reject kar di hai." });
    }

    const company = user.companyId;
    const token = generateToken(user._id, company._id, user.role);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        companyId: company._id,
        companyName: company.name,
        companyEmail: user.companyEmail,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET ME ────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate("companyId", "name companyEmail");

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    companyId: user.companyId?._id,
    companyName: user.companyId?.name,
    companyEmail: user.companyEmail,
  });
};

// ── UPDATE PROFILE ────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, companyEmail, companyEmailPassword } = req.body;
    const updateData = { name, companyEmail };
    if (companyEmailPassword) updateData.companyEmailPassword = companyEmailPassword;
    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true })
      .select("-password")
      .populate("companyId", "name");
    res.json({
      message: "Profile updated!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        companyId: user.companyId?._id,
        companyName: user.companyId?.name,
        companyEmail: user.companyEmail,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── APPROVE USER ─────────────────────────────────────────────

exports.approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "active" },
      { new: true }
    );

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.send(`
      <h2 style="color:green">
        ✅ User Approved Successfully
      </h2>
    `);

  } catch (err) {
    res.status(500).send(err.message);
  }
};

// ── REJECT USER ─────────────────────────────────────────────

exports.rejectUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.send(`
      <h2 style="color:red">
        ❌ User Rejected Successfully
      </h2>
    `);

  } catch (err) {
    res.status(500).send(err.message);
  }
};