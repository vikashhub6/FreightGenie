// features/dashboard/services/dashboardService.js
import api from "../../../api/axiosInstance";

export const getAllShipmentsAPI = () => api.get("/shipments");
