// features/exporter/pages/ExporterUploadPage.js
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getShipmentByTokenAPI } from "../services/exporterService";
import useUpload from "../hooks/useUpload";

export default function ExporterUploadPage() {
  const { token } = useParams();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState({ name: "", company: "", phone: "", address: "" });
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const fileRef = useRef();
  const { uploading, error, submitDetails, uploadFiles } = useUpload(token);

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
      <div className="max-w-lg mx-auto pt-10">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🚢</div>
          <h1 className="text-2xl font-bold text-blue-700">ShipChain</h1>
          <p className="text-gray-500 text-sm mt-1">Document Upload Portal</p>
        </div>

        {shipment && (
          <div className="bg-white border border-blue-100 rounded-xl p-4 mb-6 text-sm">
            <div className="font-semibold text-gray-700 mb-2">Shipment Details:</div>
            <div className="grid grid-cols-2 gap-2 text-gray-600">
              <div>📦 {shipment.product}</div>
              <div>🌍 {shipment.origin} → {shipment.destination}</div>
            </div>
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"}`}>{s}</div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-blue-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="card">
            <h2 className="font-bold text-lg mb-4">Your Details</h2>
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div><label className="label">Full Name</label><input className="input" placeholder="Your name" value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} required /></div>
              <div><label className="label">Company Name</label><input className="input" placeholder="Company name" value={details.company} onChange={(e) => setDetails({ ...details, company: e.target.value })} required /></div>
              <div><label className="label">Phone</label><input className="input" placeholder="+91 XXXXXXXXXX" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} /></div>
              <div><label className="label">Address</label><input className="input" placeholder="Business address" value={details.address} onChange={(e) => setDetails({ ...details, address: e.target.value })} /></div>
              
              <button type="submit" className="btn-primary w-full py-2.5">Continue → Upload Documents</button>
            </form>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="card">
            <h2 className="font-bold text-lg mb-2">Upload Documents</h2>
            <p className="text-sm text-gray-500 mb-4">Upload: Commercial Invoice, Packing List, Certificates</p>
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
             
              onDrop={(e) => { e.preventDefault(); setDragging(false); setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]); }}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => setFiles(prev => [...prev, ...Array.from(e.target.files)])} />
              <div className="text-4xl mb-2">📁</div>
              <p className="font-medium text-gray-600">{dragging ? "Drop here!" : "Click or drag & drop"}</p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG • Max 10MB</p>
            </div>
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm">
                    <span>📄 {f.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">{(f.size / 1024).toFixed(0)} KB</span>
                      <button className="text-red-400" onClick={() => setFiles(files.filter((_, j) => j !== i))}>✕</button>
                    </div>
                  </div>
                ))}
                <button className="btn-primary w-full py-3 mt-2" onClick={handleUpload} disabled={uploading}>
                  {uploading ? "⏳ Uploading & Analyzing..." : `🚀 Upload ${files.length} File(s)`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="card text-center py-10">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-green-700 mb-2">Documents Submitted!</h2>
            <p className="text-gray-500">Your documents have been uploaded successfully.</p>
            <p className="text-gray-500 mt-1">The freight forwarder will review and contact you shortly.</p>
            <div className="mt-6 bg-blue-50 rounded-xl p-4 text-sm text-blue-700">🤖 AI is analyzing your documents...</div>
          </div>
        )}
      </div>
    </div>
  );
}
