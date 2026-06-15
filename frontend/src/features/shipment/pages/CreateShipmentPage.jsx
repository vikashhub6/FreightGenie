import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createShipmentAPI } from "../services/shipmentService";

const INPUT = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400";
const LABEL = "block text-xs font-semibold text-gray-700 mb-1";
const SECTION = "text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 mt-1";

export default function CreateShipmentPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const [form, setForm] = useState({
    // Cargo
    product:     "",
    cargoType:   "general",
    origin:      "",
    destination: "",
    // Consignee
    consigneeName:    "",
    consigneeAddress: "",
    consigneeCountry: "",
    notifyParty:      "",
    // Shipment
    paymentTerms:  "FOB",
    shippingMode:  "sea",
    portOfLoading: "",
    portOfDischarge: "",
    expectedShipDate: "",
    specialInstructions: "",
    // Exporter
    exporterEmail: "",
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const payload = {
        exporterEmail: form.exporterEmail,
        product:       form.product,
        origin:        form.origin,
        destination:   form.destination,
        cargoType:     form.cargoType,
        shipmentInfo: {
          consigneeName:       form.consigneeName,
          consigneeAddress:    form.consigneeAddress,
          consigneeCountry:    form.consigneeCountry,
          notifyParty:         form.notifyParty || form.consigneeName,
          paymentTerms:        form.paymentTerms,
          shippingMode:        form.shippingMode,
          portOfLoading:       form.portOfLoading,
          portOfDischarge:     form.portOfDischarge,
          expectedShipDate:    form.expectedShipDate || undefined,
          specialInstructions: form.specialInstructions,
        },
      };
      const res = await createShipmentAPI(payload);
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

      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-1">Create New Shipment</h1>
        <p className="text-gray-500 text-sm mb-6">Fill in shipment details — exporter will receive a secure upload link</p>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── CARGO DETAILS ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className={SECTION}>📦 Cargo Details</p>
            <div className="space-y-4">
              <div>
                <label className={LABEL}>Product / Cargo Description *</label>
                <input className={INPUT} placeholder="e.g. Cotton Fabric, Electronic Components" value={form.product} onChange={set("product")} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Cargo Type *</label>
                  <select className={INPUT} value={form.cargoType} onChange={set("cargoType")}>
                    {["general","electronics","textile","food","chemicals","machinery","pharma","furniture","auto_parts"].map(c => (
                      <option key={c} value={c}>{c.replace("_"," ").replace(/\b\w/g,l=>l.toUpperCase())}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Shipping Mode *</label>
                  <select className={INPUT} value={form.shippingMode} onChange={set("shippingMode")}>
                    <option value="sea">🚢 Sea</option>
                    <option value="air">✈️ Air</option>
                    <option value="road">🚛 Road</option>
                    <option value="rail">🚂 Rail</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Origin Country / Port *</label>
                  <input className={INPUT} placeholder="e.g. India / Nhava Sheva" value={form.origin} onChange={set("origin")} required />
                </div>
                <div>
                  <label className={LABEL}>Destination Country / Port *</label>
                  <input className={INPUT} placeholder="e.g. UAE / Jebel Ali" value={form.destination} onChange={set("destination")} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Port of Loading</label>
                  <input className={INPUT} placeholder="e.g. Nhava Sheva, Mumbai" value={form.portOfLoading} onChange={set("portOfLoading")} />
                </div>
                <div>
                  <label className={LABEL}>Port of Discharge</label>
                  <input className={INPUT} placeholder="e.g. Jebel Ali, Dubai" value={form.portOfDischarge} onChange={set("portOfDischarge")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Payment Terms</label>
                  <select className={INPUT} value={form.paymentTerms} onChange={set("paymentTerms")}>
                    {["FOB","CIF","EXW","CFR","DDP","DAP"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Expected Ship Date</label>
                  <input className={INPUT} type="date" value={form.expectedShipDate} onChange={set("expectedShipDate")} />
                </div>
              </div>
            </div>
          </div>

          {/* ── CONSIGNEE DETAILS ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className={SECTION}>🏢 Consignee Details (Buyer)</p>
            <div className="space-y-4">
              <div>
                <label className={LABEL}>Consignee Name / Company *</label>
                <input className={INPUT} placeholder="Buyer company name" value={form.consigneeName} onChange={set("consigneeName")} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Consignee Country</label>
                  <input className={INPUT} placeholder="e.g. United Arab Emirates" value={form.consigneeCountry} onChange={set("consigneeCountry")} />
                </div>
                <div>
                  <label className={LABEL}>Notify Party</label>
                  <input className={INPUT} placeholder="Usually same as consignee" value={form.notifyParty} onChange={set("notifyParty")} />
                </div>
              </div>
              <div>
                <label className={LABEL}>Consignee Address</label>
                <textarea className={INPUT} rows={2} placeholder="Full address of buyer" value={form.consigneeAddress} onChange={set("consigneeAddress")} />
              </div>
            </div>
          </div>

          {/* ── SPECIAL INSTRUCTIONS ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className={SECTION}>📝 Special Instructions</p>
            <textarea className={INPUT} rows={2} placeholder="e.g. Fragile cargo, keep dry, temperature controlled..." value={form.specialInstructions} onChange={set("specialInstructions")} />
          </div>

          {/* ── EXPORTER EMAIL ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className={SECTION}>📧 Exporter Invite</p>
            <label className={LABEL}>Exporter Email *</label>
            <input className={INPUT} type="email" placeholder="exporter@company.com" value={form.exporterEmail} onChange={set("exporterEmail")} required />
            <p className="text-xs text-gray-400 mt-1">A secure document upload link will be emailed to this address</p>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60">
            {loading ? "⏳ Creating & Sending Invite..." : "🚀 Create Shipment & Send Invite"}
          </button>
        </form>
      </div>
    </div>
  );
}
