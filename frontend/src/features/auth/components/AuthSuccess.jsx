// features/auth/components/AuthSuccess.js
const AuthSuccess = ({ message }) => {
  if (!message) return null;
  return <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-200">✅ {message}</div>;
};
export default AuthSuccess;
