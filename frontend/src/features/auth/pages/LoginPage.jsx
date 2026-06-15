import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import AuthInput from "../components/AuthInput";
import AuthError from "../components/AuthError";
import AuthLayout from "../components/AuthLayout";

const LoginPage = () => {
  const { login, authLoading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [pendingMsg, setPendingMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login({ email, password });
    if (result?.pending) {
      setPendingMsg(result.message);
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
            Jab admin approve kar de, tab dobara login karo.
          </p>
          <button onClick={() => setPendingMsg("")} className="btn-primary px-6 py-2">
            Wapas Login Karo
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout icon="🔐" title="Forwarder Login" subtitle="Sign in to manage your shipments">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthError message={error} />
        <AuthInput label="Email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <AuthInput label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="btn-primary w-full py-2.5" disabled={authLoading}>
          {authLoading ? "Logging in..." : "Login →"}
        </button>
      </form>

      <p className="text-center text-sm mt-5" style={{ color: "var(--text-muted)" }}>
        No account?{" "}
        <Link to="/register" className="font-semibold" style={{ color: "var(--accent-cyan)" }}>
          Register here
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
