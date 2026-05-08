// features/exporter/services/exporterService.js
import api from "../../../api/axiosInstance";

export const getShipmentByTokenAPI = (token) => api.get(`/exporter/${token}`);
export const submitExporterDetailsAPI = (token, data) => api.post(`/exporter/${token}/details`, data);
export const uploadDocumentsAPI = (token, formData) =>
  api.post(`/documents/upload/${token}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
