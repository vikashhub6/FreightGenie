// features/auth/services/authService.js
// All calls use axiosInstance — baseURL from REACT_APP_API_URL in .env

import api from "../../../api/axiosInstance";

export const loginAPI = (data) => api.post("/auth/login", data);
export const registerAPI = (data) => api.post("/auth/register", data);
export const getMeAPI = () => api.get("/auth/me");
export const updateProfileAPI = (data) => api.put("/auth/profile", data);
