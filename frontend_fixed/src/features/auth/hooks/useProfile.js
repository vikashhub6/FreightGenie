// features/auth/hooks/useProfile.js
// Profile update logic — separate from login/register
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { updateProfileAPI } from "../services/authService";

const useProfile = () => {
  const { user, setUser }           = useContext(AuthContext);
  const [profileLoading, setLoading] = useState(false);
  const [success, setSuccess]        = useState("");
  const [error, setError]            = useState("");

  const updateProfile = async (formData) => {
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const res = await updateProfileAPI(formData);
      setUser(res.data.user);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return { user, profileLoading, success, error, updateProfile };
};

export default useProfile;
