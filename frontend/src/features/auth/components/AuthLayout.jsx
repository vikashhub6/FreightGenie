// features/auth/components/AuthLayout.jsx
// Shared shell for Login & Register — matches the app's dark theme
// (Syne font, navy/cyan accents) instead of the old light-gradient page.

export default function AuthLayout({ icon, title, subtitle, children }) {
  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-primary)" }}>
      {/* Left branding panel — hidden on small screens */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden animate-fade-up"
        style={{
          background:
            "linear-gradient(160deg, #0f1117 0%, #131c2e 45%, #1e3a5f 100%)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Decorative glow */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(56,189,248,0.18), transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-72 h-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(167,139,250,0.12), transparent 70%)" }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚢</span>
            <span
              className="text-2xl font-black"
              style={{ fontFamily: "Syne,sans-serif", color: "var(--text-primary)" }}
            >
              FreightGenie
            </span>
          </div>
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
            AI-Powered Freight Compliance Platform
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <h2
            className="text-4xl font-black leading-tight"
            style={{ fontFamily: "Syne,sans-serif", color: "var(--text-primary)" }}
          >
            Compliance &amp; analytics,
            <br />
            <span style={{ color: "var(--accent-cyan)" }}>automated end-to-end.</span>
          </h2>
          <ul className="space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
            <li className="flex items-center gap-2">
              <span style={{ color: "var(--accent-emerald)" }}>●</span>
              AI compliance scoring &amp; document checklists
            </li>
            <li className="flex items-center gap-2">
              <span style={{ color: "var(--accent-cyan)" }}>●</span>
              Auto-generated booking, invoice &amp; B/L reports
            </li>
            <li className="flex items-center gap-2">
              <span style={{ color: "var(--accent-violet)" }}>●</span>
              Business insights dashboard powered by Pandas &amp; NumPy
            </li>
          </ul>
        </div>

        <p className="relative z-10 text-xs" style={{ color: "var(--text-muted)" }}>
          © {new Date().getFullYear()} FreightGenie. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md animate-fade-up-2">
          <div className="text-center mb-6 lg:hidden">
            <div className="text-4xl mb-2">🚢</div>
            <h1
              className="text-2xl font-black"
              style={{ fontFamily: "Syne,sans-serif", color: "var(--text-primary)" }}
            >
              FreightGenie
            </h1>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-1">
              {icon && <span className="text-2xl">{icon}</span>}
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: "Syne,sans-serif", color: "var(--text-primary)" }}
              >
                {title}
              </h2>
            </div>
            {subtitle && (
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                {subtitle}
              </p>
            )}
            {!subtitle && <div className="mb-6" />}

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
