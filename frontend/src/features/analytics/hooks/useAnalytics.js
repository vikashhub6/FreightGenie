// features/analytics/hooks/useAnalytics.js
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { getInsights, getChartsData, refreshAnalytics } from "../services/analyticsService";

export default function useAnalytics() {
  const { user } = useAuth();
  const companyId = user?.companyId;

  const [insights, setInsights] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [chartsRes, insightsRes] = await Promise.all([
        getChartsData(companyId),
        getInsights(companyId),
      ]);

      console.log("chartsRes:", chartsRes);
      console.log("insightsRes:", insightsRes);

      setInsights({
        chartUrls: chartsRes?.chartUrls || {},
        stats:     chartsRes?.stats     || {},
        insights:  insightsRes?.insights || [],
      });
    } catch (err) {
      console.error("Analytics error:", err);
      setError(
        err.response?.status === 404
          ? "No shipment data yet. Complete a shipment's compliance review to start generating analytics."
          : "Could not reach the Analytics service. Make sure analytics/api.py is running."
      );
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshAnalytics(companyId);
      await load();
    } catch (err) {
      setError("Refresh failed. Make sure analytics/api.py is running.");
    } finally {
      setRefreshing(false);
    }
  }, [companyId, load]);

  useEffect(() => {
    load();
  }, [load]);

  return { insights, loading, error, refreshing, handleRefresh, reload: load };
}