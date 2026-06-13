// features/auth/pages/LoginPage.js
// Page only handles UI + calls hook — NO direct API calls here!
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import AuthInput from "../components/AuthInput";
import AuthError from "../components/AuthError";
import AuthLayout from "../components/AuthLayout";

const LoginPage = () => {
  const { login, authLoading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login({ email, password });
    if (success) navigate("/dashboard");
  };

  return (
    <AuthLayout icon="🔐" title="Forwarder Login" subtitle="Sign in to manage your shipments">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthError message={error} />

        <AuthInput
          label="Email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <AuthInput
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

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
