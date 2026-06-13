// features/analytics/hooks/useAnalytics.js
import { useState, useEffect, useCallback } from "react";
import { getInsights, getChartsData, refreshAnalytics } from "../services/analyticsService";

export default function useAnalytics() {
  const [insights, setInsights] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [insightsRes, chartsRes] = await Promise.all([getInsights(), getChartsData()]);
      setInsights(insightsRes);
      setCharts(chartsRes);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "No shipment data yet. Complete a shipment's compliance review to start generating analytics."
          : "Could not reach the Analytics service. Make sure analytics/api.py is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshAnalytics();
      await load();
    } catch (err) {
      setError("Refresh failed. Make sure analytics/api.py is running.");
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  return { insights, charts, loading, error, refreshing, handleRefresh, reload: load };
}
