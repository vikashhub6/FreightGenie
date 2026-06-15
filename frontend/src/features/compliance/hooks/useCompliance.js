// features/compliance/hooks/useCompliance.js
import { useState } from "react";
import { getComplianceReportAPI } from "../services/complianceService";

const useCompliance = () => {
  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCompliance = async (shipmentId) => {
    setLoading(true);
    try {
      const res = await getComplianceReportAPI(shipmentId);
      setCompliance(res.data);
      return res.data;
    } catch (err) {
      console.error("Compliance fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return { compliance, setCompliance, loading, fetchCompliance };
};

export default useCompliance;
