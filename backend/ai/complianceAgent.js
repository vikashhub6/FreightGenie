const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function callGroq(systemPrompt, userPrompt) {
  console.log("🌐 [GROQ-REQUEST] Calling GROQ API...");
  console.log("   Model: llama-3.3-70b-versatile");
  console.log("   API Key configured:", !!process.env.GROQ_API_KEY);
  
  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 2000,
    });

    console.log("✅ [GROQ-RESPONSE] Received response");
    console.log("   Content length:", response.choices[0].message.content.length);

    const text = response.choices[0].message.content;
    try {
      const cleaned = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      const parsed = match ? JSON.parse(match[0]) : JSON.parse(cleaned);
      console.log("✅ [JSON-PARSED] Successfully parsed GROQ response");
      console.log("   Fields:", Object.keys(parsed).join(", "));
      return parsed;
    } catch (parseErr) {
      console.error("⚠️ [JSON-PARSE-ERROR] Failed to parse JSON");
      console.error("   Error:", parseErr.message);
      return { raw: text };
    }
  } catch (apiErr) {
    console.error("❌ [GROQ-API-ERROR] GROQ API call failed");
    console.error("   Error:", apiErr.message);
    console.error("   Error type:", apiErr.constructor.name);
    if (apiErr.response) {
      console.error("   HTTP Status:", apiErr.response.status);
      console.error("   Response:", apiErr.response.data);
    }
    throw apiErr;
  }
}

async function runFullAIAnalysis(documents, shipmentInfo) {
  const hasDocuments = documents && documents.length > 0;

  const uploadedDocsList = hasDocuments
    ? documents
        .map(
          (d) =>
            `- ${d.type?.toUpperCase() || "OTHER"}: ${d.name} ${d.text ? `(${d.text.slice(0, 400).replace(/\n/g, " ")}...)` : "(no text extracted)"}`,
        )
        .join("\n")
    : "No documents uploaded yet";

  const fullDocText = hasDocuments
    ? documents
        .map((d) => `=== ${d.name} ===\n${d.text || "(image/no text)"}`)
        .join("\n\n")
        .slice(0, 4000)
    : "";

  return await callGroq(
    `You are a senior international trade compliance officer with 20+ years of experience in customs, freight forwarding, and export regulations across Asia, Middle East, Europe, and Americas.

Analyze shipment documents and provide a THOROUGH, REALISTIC compliance assessment.

Rules:
- Be VERY specific — mention actual document issues found
- Give realistic 6-digit HS codes for the product
- Give realistic duty % and freight cost ranges based on actual route
- Identify REAL missing documents required for this specific route and product
- Score strictly: missing required docs = major penalty
- Always respond ONLY with valid JSON. No markdown, no text outside JSON.`,

    `Analyze this international shipment:

SHIPMENT INFO:
- Product: ${shipmentInfo.product}
- Route: ${shipmentInfo.origin} → ${shipmentInfo.destination}
- Cargo Type: ${shipmentInfo.cargoType || "general"}
- Exporter: ${shipmentInfo.exporterName || "Not provided"}

UPLOADED DOCUMENTS:
${uploadedDocsList}

DOCUMENT TEXT:
${fullDocText || "No text content available"}

Respond with EXACT JSON:
{
  "score": <0-100>,
  "riskLevel": "low" | "medium" | "high",
  "status": "compliant" | "needs_review" | "non_compliant",
  "summary": "<3-4 sentences with specific findings>",
  "missingDocs": ["<specific missing docs for this route/product>"],
  "hsCode": "<6-digit HS code>",
  "dutyEstimate": "<realistic duty % range>",
  "freightCost": "<realistic USD range>",
  "totalCost": "<total estimated landed cost USD>",
  "expiryAlerts": [{"doc": "<name>", "date": "<date or N/A>"}],
  "checklist": [
    {"task": "<specific task>", "assignedTo": "exporter" | "forwarder", "status": "ok" | "warning" | "missing"}
  ],
  "issues": ["<specific issues found>"],
  "suggestions": ["<specific actionable recommendations>"],
  "regulatoryNotes": "<special regulations for this route>"
}`,
  );
}

async function generateEmailDraft(shipment) {
  const report = shipment.complianceReport;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    max_tokens: 1500,
    messages: [
      {
        role: "system",
        content:
          "You are a professional freight forwarder. Write clear compliance emails. Respond ONLY with valid JSON. Use \\n for line breaks.",
      },
      {
        role: "user",
        content: `Write a professional compliance email.

Exporter: ${shipment.exporterName || "Exporter"}
Shipment ID: ${shipment.shipmentId}
Product: ${shipment.product}
Route: ${shipment.origin} → ${shipment.destination}
Score: ${report.score}/100
Risk: ${report.riskLevel?.toUpperCase()}
Status: ${report.status}
Missing Docs: ${(report.missingDocs || []).join(", ") || "None"}
Issues: ${(report.issues || []).join(", ") || "None"}
HS Code: ${report.hsCode || "TBD"}
Duty: ${report.dutyEstimate || "TBD"}
Freight: ${report.freightCost || "TBD"}
Total Cost: ${report.totalCost || "TBD"}
Suggestions: ${(report.suggestions || []).join(", ")}

Return JSON only:
{"subject": "...", "body": "Dear ${shipment.exporterName || "Exporter"},\\n\\n...\\n\\nRegards,\\nFreight Forwarding Team"}`,
      },
    ],
  });

  const text = response.choices[0].message.content;
  try {
    const cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (parsed.body) parsed.body = parsed.body.replace(/\\n/g, "\n");
      return parsed;
    }
  } catch (e) {
    console.error("Email parse error:", e.message);
  }

  return {
    subject: `Compliance Report — ${shipment.shipmentId} | Score: ${report.score}/100`,
    body: `Dear ${shipment.exporterName || "Exporter"},\n\nPlease find below the compliance analysis for your shipment.\n\nShipment ID: ${shipment.shipmentId}\nProduct: ${shipment.product}\nRoute: ${shipment.origin} → ${shipment.destination}\nScore: ${report.score}/100\nRisk: ${report.riskLevel?.toUpperCase()}\n\n${report.summary || ""}\n\n${report.missingDocs?.length ? `MISSING DOCUMENTS:\n${report.missingDocs.map((d) => `• ${d}`).join("\n")}\n\n` : ""}HS Code: ${report.hsCode || "TBD"}\nFreight: ${report.freightCost || "TBD"}\nDuty: ${report.dutyEstimate || "TBD"}\nTotal: ${report.totalCost || "TBD"}\n\nBest regards,\nFreight Forwarding Team`,
  };
}

module.exports = { runFullAIAnalysis, generateEmailDraft };
