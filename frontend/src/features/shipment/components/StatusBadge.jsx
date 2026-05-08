const STATUS_LABEL = {
  pending:          "Pending",
  invite_sent:      "Invite Sent",
  docs_uploaded:    "Docs Uploaded",
  ai_analyzing:     "AI Analyzing…",
  awaiting_review:  "Awaiting Review",
  compliance_done:  "Compliance Done",
  email_sent:       "Email Sent",
  completed:        "Completed",
};

const StatusBadge = ({ status }) => (
  <span className={`badge-${status}`}>
    {STATUS_LABEL[status] || status}
  </span>
);

export default StatusBadge;
