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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 shadow-sm">
        <button onClick={() => navigate("/dashboard")} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
        <span className="text-2xl">🚢</span>
        <span className="text-xl font-bold text-blue-700">ShipChain</span>
        <span className="text-gray-400 text-sm ml-2">/ Profile Settings</span>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-1">Profile Settings</h1>
        <p className="text-gray-500 text-sm mb-6">Update your company info and email settings</p>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthSuccess message={success} />
            <AuthError message={error} />

            <AuthInput label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <AuthInput label="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} required />

            <div className="border-t pt-4">
              <p className="text-xs font-semibold text-blue-600 uppercase mb-1">📧 Company Email Settings</p>
              <p className="text-xs text-gray-400 mb-3">Exporters receive emails FROM this address</p>
              <div className="space-y-3">
                <AuthInput label="Company Email" type="email" placeholder="info@yourcompany.com" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
                {user?.companyEmail && <p className="text-xs text-green-600">✅ Current: {user.companyEmail}</p>}
                <AuthInput label="Gmail App Password" type="password" placeholder="Leave blank to keep current" value={companyEmailPassword} onChange={(e) => setCompanyEmailPassword(e.target.value)} />
                <p className="text-xs text-gray-400">Google Account → Security → App Passwords → Generate new</p>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-2.5" disabled={profileLoading}>
              {profileLoading ? "Saving..." : "💾 Save Changes"}
            </button>
          </form>
        </div>

        <div className="card mt-4">
          <h3 className="font-semibold text-sm mb-2 text-gray-700">Account Info</h3>
          <p className="text-sm text-gray-500">Login Email: <span className="font-medium text-gray-700">{user?.email}</span></p>
          <button className="btn-danger text-sm mt-4" onClick={() => { logout(); navigate("/login"); }}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
