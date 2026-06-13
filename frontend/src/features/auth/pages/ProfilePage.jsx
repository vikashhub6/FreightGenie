// features/auth/pages/ProfilePage.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useProfile from "../hooks/useProfile";
import AuthInput from "../components/AuthInput";
import AuthError from "../components/AuthError";
import AuthSuccess from "../components/AuthSuccess";

const ProfilePage = () => {
  const { user, logout }                          = useAuth();
  const { profileLoading, success, error, updateProfile } = useProfile();
  const navigate = useNavigate();

  const [name, setName]                               = useState(user?.name || "");
  const [company, setCompany]                         = useState(user?.company || "");
  const [companyEmail, setCompanyEmail]               = useState(user?.companyEmail || "");
  const [companyEmailPassword, setCompanyEmailPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile({ name, company, companyEmail, companyEmailPassword });
    setCompanyEmailPassword("");
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <nav
        className="px-6 py-4 flex items-center gap-4"
        style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}
      >
        <button
          onClick={() => navigate("/dashboard")}
          className="text-xl"
          style={{ color: "var(--text-muted)" }}
        >
          ←
        </button>
        <span className="text-2xl">🚢</span>
        <span className="text-xl font-black" style={{ fontFamily: "Syne,sans-serif", color: "var(--text-primary)" }}>
          FreightGenie
        </span>
        <span className="text-sm ml-2" style={{ color: "var(--text-muted)" }}>/ Profile Settings</span>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-10 animate-fade-up">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Profile Settings</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Update your company info and email settings
        </p>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthSuccess message={success} />
            <AuthError message={error} />

            <AuthInput label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <AuthInput label="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} required />

            <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--accent-cyan)" }}>
                📧 Company Email Settings
              </p>
              <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                Exporters receive emails FROM this address
              </p>
              <div className="space-y-3">
                <AuthInput label="Company Email" type="email" placeholder="info@yourcompany.com" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
                {user?.companyEmail && (
                  <p className="text-xs" style={{ color: "var(--accent-emerald)" }}>✅ Current: {user.companyEmail}</p>
                )}
                <AuthInput
                  label="Gmail App Password"
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={companyEmailPassword}
                  onChange={(e) => setCompanyEmailPassword(e.target.value)}
                  hint="Google Account → Security → App Passwords → Generate new"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-2.5" disabled={profileLoading}>
              {profileLoading ? "Saving..." : "💾 Save Changes"}
            </button>
          </form>
        </div>

        <div className="card mt-4">
          <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--text-primary)" }}>Account Info</h3>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Login Email: <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{user?.email}</span>
          </p>
          <button className="btn-danger text-sm mt-4" onClick={() => { logout(); navigate("/login"); }}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
