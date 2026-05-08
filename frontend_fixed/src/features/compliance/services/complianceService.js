// features/compliance/services/complianceService.js
import api from "../../../api/axiosInstance";

export const getComplianceReportAPI = (shipmentId) =>
  api.get(`/compliance/${shipmentId}`);

export const generateEmailDraftAPI = (shipmentId) =>
  api.post(`/compliance/${shipmentId}/generate-email`);

export const analyzeComplianceAPI = (shipmentId) =>
  api.post(`/compliance/${shipmentId}/analyze`);

export const approveReportAPI = (shipmentId) =>
  api.post(`/compliance/${shipmentId}/approve`);

export const generatePDFAPI = (shipmentId) =>
  api.post(`/compliance/${shipmentId}/generate-pdf`);

export const previewPDFAPI = (shipmentId) =>
  api.get(`/compliance/${shipmentId}/preview-pdf`, { responseType: "blob" });

export const downloadPDFAPI = (shipmentId) =>
  api.get(`/compliance/${shipmentId}/download-pdf`, { responseType: "blob" });
