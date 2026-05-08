// features/email/hooks/useEmailActions.js
import { useState } from "react";
import { generateEmailAPI, saveDraftAPI, sendEmailAPI, sendMissingAlertAPI } from "../../shipment/services/shipmentService";

const useEmailActions = (id, setEmailDraft, reload) => {
  const [actionLoading, setActionLoading] = useState("");

  const handleGenerateEmail = async () => {
    setActionLoading("email");
    try {
      const res = await generateEmailAPI(id);
      setEmailDraft({ subject: res.data.subject, body: res.data.body });
      return res.data;
    } catch (err) {
      alert(err.response?.data?.error || "Failed to generate email");
    } finally {
      setActionLoading("");
    }
  };

  const handleSaveDraft = async (draft) => {
    setActionLoading("save");
    try {
      await saveDraftAPI(id, draft);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save draft");
    } finally {
      setActionLoading("");
    }
  };

  const handleSendEmail = async () => {
    setActionLoading("send");
    try {
      await sendEmailAPI(id);
      await reload();
      alert("✅ Email sent with PDF report attached!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send email");
    } finally {
      setActionLoading("");
    }
  };

  const handleMissingAlert = async () => {
    setActionLoading("alert");
    try {
      await sendMissingAlertAPI(id);
      alert("Missing docs alert sent!");
    } catch (err) {
      alert(err.response?.data?.error || "No missing docs found");
    } finally {
      setActionLoading("");
    }
  };

  return { actionLoading, handleGenerateEmail, handleSaveDraft, handleSendEmail, handleMissingAlert };
};

export default useEmailActions;
