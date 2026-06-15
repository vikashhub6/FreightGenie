// features/shipment/hooks/useShipment.js
import { useState, useEffect } from "react";
import { getShipmentAPI } from "../services/shipmentService";

const useShipment = (id) => {
  const [shipment, setShipment] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [emailDraft, setEmailDraft] = useState({ subject: "", body: "" });
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    const res = await getShipmentAPI(id);
    setShipment(res.data);
    if (res.data.complianceReport) setCompliance(res.data.complianceReport);
    if (res.data.emailDraft) {
      setEmailDraft({
        subject: res.data.emailDraft.subject || "",
        body: res.data.emailDraft.editedBody || res.data.emailDraft.body || "",
      });
    }
    return res.data;
  };

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [id]);

  return { shipment, setShipment, compliance, emailDraft, setEmailDraft, loading, reload };
};

export default useShipment;
