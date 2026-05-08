// features/email/pages/EmailPage.js
// This page is embedded inside ShipmentDetailPage as a tab
// Exported as a standalone component for reuse

import EmailDraft from "../components/EmailDraft";

export default function EmailPage({ shipmentId, draft, compliance, onGenerate, onSave, onSend, sentAt, actionLoading }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-800">AI Email Draft</h2>
      </div>
      <EmailDraft
        draft={draft}
        compliance={compliance}
        onGenerate={onGenerate}
        onSave={onSave}
        onSend={onSend}
        sentAt={sentAt}
        actionLoading={actionLoading}
      />
    </div>
  );
}
