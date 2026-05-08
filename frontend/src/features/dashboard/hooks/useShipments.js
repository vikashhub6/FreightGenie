// features/dashboard/hooks/useShipments.js
import { useState, useEffect } from "react";
import { getAllShipmentsAPI } from "../../shipment/services/shipmentService";

const useShipments = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllShipmentsAPI()
      .then((res) => setShipments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: shipments.length,
    pending: shipments.filter((s) => ["pending", "invite_sent"].includes(s.status)).length,
    analyzing: shipments.filter((s) => s.status === "ai_analyzing").length,
    done: shipments.filter((s) => ["compliance_done", "email_sent", "completed"].includes(s.status)).length,
  };

  return { shipments, loading, stats };
};

export default useShipments;
