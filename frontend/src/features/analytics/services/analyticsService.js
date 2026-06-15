// features/analytics/services/analyticsService.js
// FastAPI analytics — SEPARATE service, alag base URL

import axios from "axios";

if (!process.env.REACT_APP_ANALYTICS_URL) {
  console.error("Missing REACT_APP_ANALYTICS_URL in environment.");
}

const analyticsApi = axios.create({
  baseURL: process.env.REACT_APP_ANALYTICS_URL,
  timeout: 15000,
});

// ✅ companyId paas karo — sirf apni company ka data aayega
export async function getInsights(companyId) {
  const params = companyId ? { companyId } : {};
  const { data } = await analyticsApi.get("/insights", { params });
  return data;
}

export async function getChartsData(companyId) {
  const params = companyId ? { companyId } : {};
  const { data } = await analyticsApi.get("/charts", { params });
  return data;
}

export async function refreshAnalytics(companyId) {
  const params = companyId ? { companyId } : {};
  const { data } = await analyticsApi.post("/refresh", null, { params });
  return data;
}

export function chartImageUrl(filename) {
  return `${analyticsApi.defaults.baseURL}/charts/${filename}`;
}

export default analyticsApi;
