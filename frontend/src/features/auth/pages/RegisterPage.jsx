// features/auth/pages/RegisterPage.js
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import AuthInput from "../components/AuthInput";
import AuthError from "../components/AuthError";

const RegisterPage = () => {
  const { register, authLoading, error } = useAuth();
  const navigate = useNavigate();

  const [name, setName]                         = useState("");
  const [company, setCompany]                   = useState("");
  const [email, setEmail]                       = useState("");
  const [password, setPassword]                 = useState("");
  const [companyEmail, setCompanyEmail]         = useState("");
  const [companyEmailPassword, setCompanyEmailPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register({ name, company, email, password, companyEmail, companyEmailPassword });
    if (success) navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🚢</div>
          <h1 className="text-3xl font-bold text-blue-700">FreightGenie</h1>
          <p className="text-gray-500 mt-1">Create Forwarder Account</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-6">Register</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthError message={error} />

            <AuthInput label="Full Name" placeholder="Rahul Sharma" value={name} onChange={(e) => setName(e.target.value)} required />
            <AuthInput label="Company Name" placeholder="ABC Freight Pvt Ltd" value={company} onChange={(e) => setCompany(e.target.value)} required />
            <AuthInput label="Login Email" type="email" placeholder="you@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <AuthInput label="Password" type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

            <div className="border-t pt-4">
              <p className="text-xs font-semibold text-blue-600 uppercase mb-1">📧 Company Email Settings</p>
              <p className="text-xs text-gray-400 mb-3">Exporters will receive emails FROM this address</p>
              <div className="space-y-3">
                <AuthInput label="Company Email" type="email" placeholder="info@abcfreight.com" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} required />
                <AuthInput label="Gmail App Password" type="password" placeholder="16-char App Password" value={companyEmailPassword} onChange={(e) => setCompanyEmailPassword(e.target.value)} required />
                <p className="text-xs text-gray-400">Google Account → Security → App Passwords → Generate</p>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-2.5" disabled={authLoading}>
              {authLoading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have account?{" "}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
