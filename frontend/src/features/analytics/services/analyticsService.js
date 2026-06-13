// features/analytics/services/analyticsService.js
// Talks to the Flask analytics API (Phase 2), which is a SEPARATE
// service from the main Node/Express backend — so it gets its own
// axios instance with its own base URL.

import axios from "axios";

if (!process.env.REACT_APP_ANALYTICS_URL) {
  console.error(
    "Missing REACT_APP_ANALYTICS_URL in environment. Set it in frontend/.env.local"
  );
}

const analyticsApi = axios.create({
  baseURL: process.env.REACT_APP_ANALYTICS_URL,
  timeout: 15000,
});

export async function getInsights() {
  const { data } = await analyticsApi.get("/insights");
  return data;
}

export async function getChartsData() {
  const { data } = await analyticsApi.get("/charts");
  return data;
}

export async function refreshAnalytics() {
  const { data } = await analyticsApi.post("/refresh");
  return data;
}

export function chartImageUrl(filename) {
  return `${analyticsApi.defaults.baseURL}/charts/${filename}`;
}

export default analyticsApi;
