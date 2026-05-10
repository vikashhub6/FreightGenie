// features/auth/pages/LoginPage.js
// Page only handles UI + calls hook — NO direct API calls here!
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import AuthInput from "../components/AuthInput";
import AuthError from "../components/AuthError";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🚢</div>
          <h1 className="text-3xl font-bold text-blue-700">freightGenie</h1>
          <p className="text-gray-500 mt-1">AI-Powered Freight Compliance</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-6">Forwarder Login</h2>

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

          <p className="text-center text-sm text-gray-500 mt-4">
            No account?{" "}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
