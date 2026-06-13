// features/auth/components/AuthError.js
const AuthError = ({ message }) => {
  if (!message) return null;
  return (
    <div
      className="text-sm p-3 rounded-xl border"
      style={{
        background: "rgba(251,113,133,0.08)",
        borderColor: "rgba(251,113,133,0.3)",
        color: "var(--accent-rose)",
      }}
    >
      {message}
    </div>
  );
};
export default AuthError;
