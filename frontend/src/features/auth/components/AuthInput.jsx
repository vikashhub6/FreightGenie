// features/auth/components/AuthInput.js
// Reusable input for auth forms
import { useState } from "react";

const AuthInput = ({ label, type = "text", placeholder, value, onChange, required, minLength }) => {
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
        />
        {isPassword && (
          <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-500" onClick={() => setShowPass(!showPass)}>
            {showPass ? "Hide" : "Show"}
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthInput;
