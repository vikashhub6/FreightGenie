// features/exporter/hooks/useUpload.js
import { useState } from "react";
import { uploadDocumentsAPI, submitExporterDetailsAPI } from "../services/exporterService";

const useUpload = (token) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const submitDetails = async (details) => {
    try {
      await submitExporterDetailsAPI(token, details);
      return true;
    } catch {
      setError("Failed to save details");
      return false;
    }
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    const formData = new FormData();
    files.forEach((f) => formData.append("documents", f));
    try {
      await uploadDocumentsAPI(token, formData);
      return true;
    } catch {
      setError("Upload failed. Try again.");
      return false;
    } finally {
      setUploading(false);
    }
  };

  return { uploading, error, setError, submitDetails, uploadFiles };
};

export default useUpload;
