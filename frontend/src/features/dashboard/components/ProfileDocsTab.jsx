export default function ProfileDocsTab({ shipment }) {
  const details = shipment.exporterDetails;

  return (
    <div>
      <h3 className="text-white font-semibold mb-4">📋 Exporter Profile & Documents</h3>

      {/* Exporter Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: "Name", value: details?.name || shipment.exporterName || "—" },
          { label: "Email", value: shipment.exporterEmail },
          { label: "Company", value: details?.company || "—" },
          { label: "Phone", value: details?.phone || "—" },
          { label: "Address", value: details?.address || "—" },
          { label: "Submitted At", value: details?.submittedAt ? new Date(details.submittedAt).toLocaleString("en-IN") : "—" },
        ].map((item) => (
          <div key={item.label} className="bg-slate-800/50 rounded-xl p-3">
            <p className="text-xs text-slate-500 mb-1">{item.label}</p>
            <p className="text-sm text-white">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Documents */}
      <h4 className="text-slate-300 font-medium mb-3">Uploaded Documents</h4>
      {shipment.documents?.length === 0 ? (
        <p className="text-slate-500 text-sm">No documents uploaded yet</p>
      ) : (
        <div className="space-y-2">
          {shipment.documents?.map((doc, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
              <span className="text-xl">📄</span>
              <div className="flex-1">
                <p className="text-sm text-white">{doc.originalName || doc.name}</p>
                <p className="text-xs text-slate-500 capitalize">
                  {doc.type} • {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("en-IN") : "—"}
                </p>
              </div>
              {doc.cloudinaryUrl ? (
                <a
                  href={doc.cloudinaryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 whitespace-nowrap"
                >
                  View →
                </a>
              ) : (
                <span className="text-xs text-slate-600">No URL</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
