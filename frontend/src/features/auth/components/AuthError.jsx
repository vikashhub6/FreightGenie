// features/auth/components/AuthError.js
const AuthError = ({ message }) => {
  if (!message) return null;
  return <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{message}</div>;
};
export default AuthError;
