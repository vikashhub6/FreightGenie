// features/email/services/emailService.js
import api from "../../../api/axiosInstance";

export const saveDraftAPI = (shipmentId, data) =>
  api.put(`/email/${shipmentId}/draft`, data);

export const sendEmailAPI = (shipmentId) =>
  api.post(`/email/${shipmentId}/send`);

export const sendMissingAlertAPI = (shipmentId) =>
  api.post(`/email/${shipmentId}/missing-alert`);
