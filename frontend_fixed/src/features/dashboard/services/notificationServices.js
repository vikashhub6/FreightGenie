// features/dashboard/services/notificationService.js
import api from "../../../api/axiosInstance";

export const getNotificationsAPI = () => api.get("/notifications");
export const markReadAPI = (id) => api.patch(`/notifications/${id}/read`);
export const markAllReadAPI = () => api.patch("/notifications/read-all");
