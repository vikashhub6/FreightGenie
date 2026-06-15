import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getShipmentByTokenAPI } from "../services/exporterService";
import useUpload from "../hooks/useUpload";

const INPUT = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300";
const LABEL = "block text-xs font-semibold text-gray-600 mb-1";
const SECTION = "text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 mt-1";

export default function ExporterUploadPage() {
  const { token } = useParams();
  const [shipment, setShipment]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [step, setStep]           = useState(1);
  const [fetchError, setFetchError] = useState("");
  const [files, setFiles]         = useState([]);
  const [dragging, setDragging]   = useState(false);
  const fileRef = useRef();
  const { uploading, error, submitDetails, uploadFiles } = useUpload(token);

  const [details, setDetails] = useState({
    // Company info
    name: "", company: "", phone: "", address: "",
    gstNumber: "", iecCode: "", bankName: "",
    // Cargo details
    invoiceNumber: "", invoiceValue: "", invoiceCurrency: "USD",
    packageCount: "", grossWeight: "", netWeight: "",
    volume: "", hsCode: "",
  });

  const set = (k) => (e) => setDetails({ ...details, [k]: e.target.value });

  useEffect(() => {
    getShipmentByTokenAPI(token)
      .then((res) => { setShipment(res.data); if (res.data.alreadySubmitted) setStep(3); })
      .catch(() => setFetchError("Invalid or expired link"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    const ok = await submitDetails(details);
    if (ok) setStep(2);
  };

  const handleUpload = async () => {
    if (!files.length) return;
    const ok = await uploadFiles(files);
    if (ok) setStep(3);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  if (fetchError) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><div className="text-5xl mb-4">❌</div><p className="text-red-500">{fetchError}</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-lg mx-auto pt-8 pb-16">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🚢</div>
          <h1 className="text-2xl font-bold text-blue-700">FreightGenie</h1>
          <p className="text-gray-500 text-sm mt-1">Exporter Document Portal</p>
        </div>

        {/* Shipment info */}
        {shipment && (
          <div className="bg-white border border-blue-100 rounded-xl p-4 mb-5 text-sm">
            <div className="font-semibold text-gray-700 mb-2">📦 Shipment Details</div>
            <div className="grid grid-cols-2 gap-2 text-gray-600">
              <div>Product: <span className="font-medium text-gray-800">{shipment.product}</span></div>
              <div>Route: <span className="font-medium text-gray-800">{shipment.origin} → {shipment.destination}</span></div>
            </div>
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {["Company Info","Documents","Done"].map((label, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= i+1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"}`}>{i+1}</div>
                <span className="text-xs text-gray-400 mt-1">{label}</span>
              </div>
              {i < 2 && <div className={`w-10 h-0.5 mb-4 ${step > i+1 ? "bg-blue-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {/* ── STEP 1: Company + Cargo Details ── */}
        {step === 1 && (
          <form onSubmit={handleDetailsSubmit} className="space-y-5">
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

            {/* Company Info */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className={SECTION}>🏢 Your Company Details</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={LABEL}>Full Name *</label><input className={INPUT} placeholder="Your name" value={details.name} onChange={set("name")} required /></div>
                  <div><label className={LABEL}>Company Name *</label><input className={INPUT} placeholder="Company" value={details.company} onChange={set("company")} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={LABEL}>Phone</label><input className={INPUT} placeholder="+91 XXXXXXXXXX" value={details.phone} onChange={set("phone")} /></div>
                  <div><label className={LABEL}>GST / Tax Number</label><input className={INPUT} placeholder="GST Number" value={details.gstNumber} onChange={set("gstNumber")} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={LABEL}>IEC Code</label><input className={INPUT} placeholder="Import Export Code" value={details.iecCode} onChange={set("iecCode")} /></div>
                  <div><label className={LABEL}>Bank Name</label><input className={INPUT} placeholder="For LC / payment" value={details.bankName} onChange={set("bankName")} /></div>
                </div>
                <div><label className={LABEL}>Business Address</label><textarea className={INPUT} rows={2} placeholder="Full business address" value={details.address} onChange={set("address")} /></div>
              </div>
            </div>

            {/* Cargo / Invoice Details */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className={SECTION}>📦 Cargo & Invoice Details</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={LABEL}>Invoice Number *</label><input className={INPUT} placeholder="e.g. INV-2024-001" value={details.invoiceNumber} onChange={set("invoiceNumber")} required /></div>
                  <div>
                    <label className={LABEL}>Invoice Value *</label>
                    <div className="flex gap-2">
                      <select className="border border-gray-200 rounded-lg px-2 py-2 text-sm w-20" value={details.invoiceCurrency} onChange={set("invoiceCurrency")}>
                        <option>USD</option><option>EUR</option><option>INR</option><option>GBP</option>
                      </select>
                      <input className={INPUT} placeholder="Amount" value={details.invoiceValue} onChange={set("invoiceValue")} required />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className={LABEL}>No. of Packages *</label><input className={INPUT} type="number" placeholder="e.g. 200" value={details.packageCount} onChange={set("packageCount")} required /></div>
                  <div><label className={LABEL}>Gross Weight (KGS)</label><input className={INPUT} placeholder="e.g. 2400" value={details.grossWeight} onChange={set("grossWeight")} /></div>
                  <div><label className={LABEL}>Net Weight (KGS)</label><input className={INPUT} placeholder="e.g. 2200" value={details.netWeight} onChange={set("netWeight")} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={LABEL}>Volume (CBM)</label><input className={INPUT} placeholder="e.g. 18.5" value={details.volume} onChange={set("volume")} /></div>
                  <div><label className={LABEL}>HS Code (if known)</label><input className={INPUT} placeholder="e.g. 5208.11" value={details.hsCode} onChange={set("hsCode")} /></div>
                </div>
              </div>
            </div>

            {/* Documents required info */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
              <p className="font-semibold text-amber-800 mb-2">📋 Documents Required (Next Step)</p>
              <ul className="text-amber-700 space-y-1">
                {["Commercial Invoice","Packing List","Certificate of Origin","IEC Certificate","Insurance Certificate","Bill of Lading Draft (if available)"].map(d => (
                  <li key={d}>• {d}</li>
                ))}
              </ul>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all">
              Continue → Upload Documents
            </button>
          </form>
        )}

        {/* ── STEP 2: Upload Documents ── */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-lg mb-1">Upload Documents</h2>
            <p className="text-sm text-gray-500 mb-4">Upload all required documents — PDF, JPG, PNG</p>
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]); }}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                onChange={(e) => setFiles(prev => [...prev, ...Array.from(e.target.files)])} />
              <div className="text-4xl mb-2">📁</div>
              <p className="font-medium text-gray-600">{dragging ? "Drop here!" : "Click or drag & drop"}</p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG • Max 10MB each</p>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm">
                    <span>📄 {f.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">{(f.size/1024).toFixed(0)} KB</span>
                      <button className="text-red-400 hover:text-red-600" onClick={() => setFiles(files.filter((_,j) => j !== i))}>✕</button>
                    </div>
                  </div>
                ))}
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl mt-2 transition-all"
                  onClick={handleUpload} disabled={uploading}>
                  {uploading ? "⏳ Uploading..." : `🚀 Submit ${files.length} Document(s)`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Done ── */}
        {step === 3 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-green-700 mb-2">Documents Submitted!</h2>
            <p className="text-gray-500">Your documents have been uploaded successfully.</p>
            <p className="text-gray-500 mt-1">The freight forwarder will review and contact you shortly.</p>
            <div className="mt-6 bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
              🤖 AI is analyzing your compliance documents...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
