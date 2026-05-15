import { useNavigate } from "react-router-dom";

const Navbar = ({ showBack = false, children }) => {
  const navigate = useNavigate();
  return (
    <nav className="px-6 py-4 flex items-center gap-4"
      style={{
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)"
      }}>
      {showBack && (
        <button onClick={() => navigate(-1)}
          className="text-xl transition-colors hover:text-white" style={{ color: "var(--text-muted)" }}>←</button>
      )}
      <span className="text-2xl cursor-pointer" onClick={() => navigate("/dashboard")}>🚢</span>
      <span className="text-xl font-black cursor-pointer" style={{ fontFamily: "Syne,sans-serif", color: "var(--text-primary)" }}
        onClick={() => navigate("/dashboard")}>FreightGenie</span>
      {children}
    </nav>
  );
};

export default Navbar;
