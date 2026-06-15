import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import AuthInput from "../components/AuthInput";
import AuthError from "../components/AuthError";
import AuthLayout from "../components/AuthLayout";

const RegisterPage = () => {
  const { register, authLoading, error } = useAuth();
  const navigate = useNavigate();

  const [name, setName]                                   = useState("");
  const [companyName, setCompanyName]                     = useState("");
  const [email, setEmail]                                 = useState("");
  const [password, setPassword]                           = useState("");
  const [companyEmail, setCompanyEmail]                   = useState("");
  const [companyEmailPassword, setCompanyEmailPassword]   = useState("");
  const [pendingMsg, setPendingMsg]                       = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register({ name, companyName, email, password, companyEmail, companyEmailPassword });
    if (result?.pending) {
      setPendingMsg(result.message || "Registration ho gayi! Admin approval ka wait karo.");
    } else if (result?.success) {
      navigate("/dashboard");
    }
  };

  if (pendingMsg) {
    return (
      <AuthLayout icon="⏳" title="Approval Pending" subtitle="Thodi der wait karo">
        <div className="text-center py-6 space-y-4">
          <div className="text-5xl">📬</div>
          <p style={{ color: "var(--text-muted)" }}>{pendingMsg}</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Admin ko email chali gayi hai. Approve hone ke baad login karo.
          </p>
          <Link to="/login" className="btn-primary inline-block px-6 py-2 mt-2">
            Login Page →
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout icon="📝" title="Create Forwarder Account" subtitle="Set up your FreightGenie workspace">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthError message={error} />

        <AuthInput label="Full Name" placeholder="Rahul Sharma" value={name} onChange={(e) => setName(e.target.value)} required />
        <AuthInput
          label="Company Name"
          placeholder="ABC Freight Pvt Ltd"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
          hint="Existing company name likhoge to employee ban jaoge (admin approval chahiye)"
        />
        <AuthInput label="Login Email" type="email" placeholder="you@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <AuthInput label="Password" type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

        <div className="pt-4 mt-2" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--accent-cyan)" }}>
            📧 Company Email Settings
          </p>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
            Exporters will receive emails FROM this address (sirf pehle admin ke liye)
          </p>
          <div className="space-y-3">
            <AuthInput label="Company Email" type="email" placeholder="info@abcfreight.com" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
            <AuthInput
              label="Gmail App Password"
              type="password"
              placeholder="16-char App Password"
              value={companyEmailPassword}
              onChange={(e) => setCompanyEmailPassword(e.target.value)}
              hint="Google Account → Security → App Passwords → Generate"
            />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full py-2.5" disabled={authLoading}>
          {authLoading ? "Creating account..." : "Create Account →"}
        </button>
      </form>

      <p className="text-center text-sm mt-5" style={{ color: "var(--text-muted)" }}>
        Already have an account?{" "}
        <Link to="/login" className="font-semibold" style={{ color: "var(--accent-cyan)" }}>
          Login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
