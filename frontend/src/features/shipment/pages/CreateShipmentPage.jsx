import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createShipmentAPI } from "../services/shipmentService";

export default function CreateShipmentPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ exporterEmail: "", product: "", origin: "", destination: "", cargoType: "general" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await createShipmentAPI(form);
      navigate(`/shipment/${res.data.shipment._id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create shipment");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 shadow-sm">
        <button onClick={() => navigate("/dashboard")} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
        <span className="text-2xl">🚢</span>
        <span className="text-xl font-bold text-blue-700">FreightGenie</span>
      </nav>
      <div className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-1">Create New Shipment</h1>
        <p className="text-gray-500 text-sm mb-8">Exporter will receive a secure upload link via email</p>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Product / Cargo Description</label>
              <input className="input" placeholder="e.g. Electronic Components, Textile Garments" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Origin Country</label>
                <input className="input" placeholder="e.g. India" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} required />
              </div>
              <div>
                <label className="label">Destination Country</label>
                <input className="input" placeholder="e.g. USA" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="label">Cargo Type</label>
              <select className="input" value={form.cargoType} onChange={(e) => setForm({ ...form, cargoType: e.target.value })}>
                {["general","electronics","textile","food","chemicals","machinery","pharma"].map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="border-t pt-4">
              <label className="label">Exporter Email</label>
              <input className="input" type="email" placeholder="exporter@company.com" value={form.exporterEmail} onChange={(e) => setForm({ ...form, exporterEmail: e.target.value })} required />
              <p className="text-xs text-gray-400 mt-1">A secure document upload link will be emailed to this address</p>
            </div>
            <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
              {loading ? "Creating & Sending Invite..." : "🚀 Create Shipment & Send Invite"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
