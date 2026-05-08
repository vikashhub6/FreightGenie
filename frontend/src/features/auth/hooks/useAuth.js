// features/auth/hooks/useAuth.js
// All auth LOGIC lives here — login, register, logout
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { loginAPI, registerAPI } from "../services/authService";

const useAuth = () => {
  const { user, loading, saveUser, logout } = useContext(AuthContext);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError]             = useState("");

  const login = async (formData) => {
    setAuthLoading(true);
    setError("");
    try {
      const res = await loginAPI(formData);
      saveUser(res.data.token, res.data.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (formData) => {
    setAuthLoading(true);
    setError("");
    try {
      const res = await registerAPI(formData);
      saveUser(res.data.token, res.data.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  return { user, loading, authLoading, error, login, register, logout };
};

export default useAuth;
