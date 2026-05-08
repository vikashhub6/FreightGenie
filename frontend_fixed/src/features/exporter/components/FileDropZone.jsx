// features/exporter/components/FileDropZone.js
import { useRef, useState } from "react";

const FileDropZone = ({ files, setFiles }) => {
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); setFiles(Array.from(e.dataTransfer.files)); }}
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden"
          onChange={(e) => setFiles(Array.from(e.target.files))} />
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
                <span className="text-gray-400">{(f.size / 1024).toFixed(0)} KB</span>
                <button className="text-red-400 hover:text-red-600"
                  onClick={() => setFiles(files.filter((_, j) => j !== i))}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileDropZone;
