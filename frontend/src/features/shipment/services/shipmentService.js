

// features/shipment/services/shipmentService.js
import api from "../../../api/axiosInstance";

export const createShipmentAPI = (data) => api.post("/shipments", data);
export const getAllShipmentsAPI = () => api.get("/shipments");
export const getShipmentAPI = (id) => api.get(`/shipments/${id}`);
export const generateEmailAPI = (id) => api.post(`/compliance/${id}/generate-email`);
export const saveDraftAPI = (id, data) => api.put(`/email/${id}/draft`, data);
export const sendEmailAPI = (id) => api.post(`/email/${id}/send`);
export const sendMissingAlertAPI = (id) => api.post(`/email/${id}/missing-alert`);

// PIN search
export const searchByPinAPI = (pin) => api.get(`/shipments/pin/${pin}`);