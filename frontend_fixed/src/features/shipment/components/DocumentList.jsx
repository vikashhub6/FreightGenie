// features/shipment/components/DocumentList.js
const DOC_ICON = { invoice: "🧾", packing_list: "📦", certificate: "📜", other: "📄" };

const DocumentList = ({ documents = [] }) => {
  if (!documents.length) return (
    <div className="text-center py-8 text-gray-400">
      <div className="text-4xl mb-2">📂</div>
      No documents yet. Waiting for exporter to upload.
    </div>
  );

  return (
    <div className="space-y-2">
      {documents.map((doc, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{DOC_ICON[doc.type] || "📄"}</span>
            <div>
              <div className="font-medium text-sm">{doc.originalName}</div>
              <div className="text-xs text-gray-400">
                {doc.type?.replace(/_/g, " ")} &nbsp;|&nbsp; {new Date(doc.uploadedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{doc.type}</span>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;
