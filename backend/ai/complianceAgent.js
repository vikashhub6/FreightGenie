const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function callGroq(systemPrompt, userPrompt) {
  console.log("🌐 [GROQ] Calling API...");
  try {
    const response = await client.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt   },
      ],
      temperature: 0.15,
      max_tokens: 2500,
    });
    const text = response.choices[0].message.content;
    const cleaned = text.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();
    const match   = cleaned.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ [GROQ-ERROR]", err.message);
    throw err;
  }
}

async function runFullAIAnalysis(documents, shipmentInfo) {
  const hasDocuments = documents && documents.length > 0;

  const uploadedDocsList = hasDocuments
    ? documents.map(d =>
        `- ${d.type?.toUpperCase() || "OTHER"}: ${d.name} ${
          d.text ? `(${d.text.slice(0, 500).replace(/\n/g," ")}...)` : "(image/no text extracted)"
        }`).join("\n")
    : "No documents uploaded yet";

  const fullDocText = hasDocuments
    ? documents.map(d => `=== ${d.name} ===\n${d.text || "(image/no text)"}`).join("\n\n").slice(0, 5000)
    : "";

  // Build rich context from all available shipment fields
  const si = shipmentInfo.shipmentInfo || {};
  const ed = shipmentInfo.exporterDetails || {};

  const contextBlock = `
SHIPMENT DETAILS:
- Shipment ID       : ${shipmentInfo.shipmentId || "—"}
- Product           : ${shipmentInfo.product}
- Cargo Type        : ${shipmentInfo.cargoType || "general"}
- Origin            : ${shipmentInfo.origin}
- Destination       : ${shipmentInfo.destination}
- Route             : ${shipmentInfo.origin} → ${shipmentInfo.destination}
- Shipping Mode     : ${si.shippingMode || "sea"}
- Port of Loading   : ${si.portOfLoading || "—"}
- Port of Discharge : ${si.portOfDischarge || "—"}
- Payment Terms     : ${si.paymentTerms || "FOB"}
- Expected Ship Date: ${si.expectedShipDate || "—"}
- Special Instructions: ${si.specialInstructions || "None"}

CONSIGNEE (BUYER):
- Name    : ${si.consigneeName || "—"}
- Country : ${si.consigneeCountry || "—"}
- Address : ${si.consigneeAddress || "—"}

EXPORTER DETAILS:
- Name          : ${ed.name || shipmentInfo.exporterName || "—"}
- Company       : ${ed.company || "—"}
- GST Number    : ${ed.gstNumber || "—"}
- IEC Code      : ${ed.iecCode || "—"}
- Bank          : ${ed.bankName || "—"}

CARGO / INVOICE:
- Invoice Number  : ${ed.invoiceNumber || "—"}
- Invoice Value   : ${ed.invoiceCurrency || "USD"} ${ed.invoiceValue || "—"}
- Packages        : ${ed.packageCount || "—"}
- Gross Weight    : ${ed.grossWeight || "—"} KGS
- Net Weight      : ${ed.netWeight || "—"} KGS
- Volume          : ${ed.volume || "—"} CBM
- HS Code (given) : ${ed.hsCode || "Not provided — determine from product"}`;

  return await callGroq(
    `You are a SENIOR INTERNATIONAL TRADE COMPLIANCE OFFICER with 25+ years of experience in:
- Indian export regulations (DGFT, Customs, FEMA)
- Middle East, Europe, USA, UK import rules
- Sea freight (FCL/LCL), Air freight compliance
- HS Code classification (6-digit, WCO standard)
- Letters of Credit, FOB/CIF/EXW documentation
- Certificate of Origin, Phytosanitary, CITES requirements

Your job: Produce a THOROUGH, REALISTIC compliance report as a real freight forwarder would.

STRICT RULES:
1. Give EXACT 6-digit HS Code for the product (research from product name + cargo type)
2. Give REALISTIC freight cost range in USD based on route + mode + weight/volume
3. Give REALISTIC customs duty % for destination country
4. List EVERY document required for this specific route + product combination
5. Check uploaded documents for: missing fields, wrong addresses, incorrect amounts, expiry
6. Score strictly — every missing required document = -10 to -15 points
7. Regulatory notes MUST be specific to the actual destination country rules
8. ONLY respond with valid JSON. Zero text outside JSON.`,

    `Analyze this shipment and produce a full compliance report:

${contextBlock}

UPLOADED DOCUMENTS (${documents?.length || 0} files):
${uploadedDocsList}

DOCUMENT CONTENT:
${fullDocText || "No text content available"}

Respond ONLY with this exact JSON structure:
{
  "score": <0-100 integer>,
  "riskLevel": "low" | "medium" | "high",
  "status": "compliant" | "needs_review" | "non_compliant",
  "summary": "<4-5 sentences — specific findings about this shipment, route, documents>",
  "hsCode": "<exact 6-digit HS code like 5208.11 or 8471.30>",
  "dutyEstimate": "<e.g. 5% customs duty + 5% VAT = ~10% total>",
  "freightCost": "<e.g. USD 750-950 (20ft FCL, Mumbai-Dubai, ~7 days)>",
  "totalCost": "<total estimated landed cost>",
  "missingDocs": ["<exact document name missing for this route>"],
  "expiryAlerts": [{"doc": "<doc name>", "date": "<expiry date or N/A>"}],
  "checklist": [
    {"task": "<specific document or action>", "assignedTo": "exporter" | "forwarder", "status": "ok" | "warning" | "missing"}
  ],
  "issues": ["<specific issue found — e.g. Invoice amount mismatch, wrong consignee address>"],
  "suggestions": ["<specific actionable recommendation>"],
  "regulatoryNotes": "<specific import rules for ${shipmentInfo.destination} — duty rates, banned items, labeling requirements, etc.>"
}`
  );
}

async function generateEmailDraft(shipment) {
  const r  = shipment.complianceReport;
  const si = shipment.shipmentInfo || {};
  const ed = shipment.exporterDetails || {};

  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-120b",
    temperature: 0.3,
    max_tokens: 1800,
    messages: [
      {
        role: "system",
        content: `You are a senior freight forwarder writing a formal compliance communication email to an exporter.
Write in professional international trade language.
Be specific — mention actual document names, actual issues, actual HS codes and costs.
Use proper freight forwarding terminology.
Respond ONLY with valid JSON. Use \\n for line breaks.`,
      },
      {
        role: "user",
        content: `Write a professional compliance email for this shipment:

Exporter Name    : ${ed.name || shipment.exporterName || "Exporter"}
Company          : ${ed.company || "—"}
Shipment ID      : ${shipment.shipmentId}
Product          : ${shipment.product}
Route            : ${shipment.origin} → ${shipment.destination}
Shipping Mode    : ${si.shippingMode?.toUpperCase() || "SEA"}
Payment Terms    : ${si.paymentTerms || "FOB"}
Invoice Number   : ${ed.invoiceNumber || "—"}
Invoice Value    : ${ed.invoiceCurrency || "USD"} ${ed.invoiceValue || "—"}
Packages         : ${ed.packageCount || "—"} pkgs | ${ed.grossWeight || "—"} KGS | ${ed.volume || "—"} CBM

COMPLIANCE RESULT:
Score            : ${r.score}/100
Risk Level       : ${r.riskLevel?.toUpperCase()}
Status           : ${r.status}
HS Code          : ${r.hsCode || "TBD"}
Freight Cost     : ${r.freightCost || "TBD"}
Duty Estimate    : ${r.dutyEstimate || "TBD"}
Total Cost       : ${r.totalCost || "TBD"}
Missing Docs     : ${(r.missingDocs || []).join(", ") || "None"}
Issues Found     : ${(r.issues || []).join("; ") || "None"}
Recommendations  : ${(r.suggestions || []).join("; ")}

Return ONLY this JSON:
{
  "subject": "<professional subject line with shipment ID and status>",
  "body": "<full formal email with proper greeting, shipment summary, compliance findings, missing docs list, cost info, action required section, deadline, regards — use \\n for line breaks>"
}`,
      },
    ],
  });

  const text = response.choices[0].message.content;
  try {
    const cleaned = text.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();
    const match   = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (parsed.body) parsed.body = parsed.body.replace(/\\n/g, "\n");
      return parsed;
    }
  } catch (e) {
    console.error("Email parse error:", e.message);
  }

  // Fallback — structured email
  return {
    subject: `Compliance Report — ${shipment.shipmentId} | Score: ${r.score}/100 | ${r.riskLevel?.toUpperCase()} RISK`,
    body: `Dear ${ed.name || shipment.exporterName || "Exporter"},\n\nGreetings from FreightGenie!\n\nPlease find below the compliance analysis for your shipment.\n\nSHIPMENT DETAILS:\nRef: ${shipment.shipmentId}\nProduct: ${shipment.product}\nRoute: ${shipment.origin} → ${shipment.destination}\nInvoice: ${ed.invoiceNumber || "—"} | Value: ${ed.invoiceCurrency || "USD"} ${ed.invoiceValue || "—"}\n\nCOMPLIANCE RESULT:\nScore: ${r.score}/100 | Risk: ${r.riskLevel?.toUpperCase()}\nHS Code: ${r.hsCode || "TBD"}\nEstimated Freight: ${r.freightCost || "TBD"}\nCustoms Duty: ${r.dutyEstimate || "TBD"}\nTotal Landed Cost: ${r.totalCost || "TBD"}\n\n${r.missingDocs?.length ? `ACTION REQUIRED — MISSING DOCUMENTS:\n${r.missingDocs.map(d => `• ${d}`).join("\n")}\n\nKindly submit the above documents at the earliest to avoid shipment delays.\n` : "All required documents have been received.\n"}\nSUMMARY:\n${r.summary || ""}\n\nFor any queries, please contact our compliance team.\n\nBest regards,\nCompliance Team\nFreightGenie International`,
  };
}

module.exports = { runFullAIAnalysis, generateEmailDraft };
