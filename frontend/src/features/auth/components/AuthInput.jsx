// features/auth/components/AuthInput.js
// Reusable input for auth forms
import { useState } from "react";

const AuthInput = ({ label, hint, type = "text", placeholder, value, onChange, required, minLength }) => {
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          className="input pr-16"
          type={isPassword && showPass ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          autoComplete={isPassword ? "current-password" : "off"}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold"
            style={{ color: "var(--accent-cyan)" }}
            onClick={() => setShowPass(!showPass)}
          >
            {showPass ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {hint && (
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {hint}
        </p>
      )}
    </div>
  );
};

export default AuthInput;
