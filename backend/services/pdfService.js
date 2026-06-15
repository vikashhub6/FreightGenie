const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const C = {
  navy:   "#0B2545", blue:   "#1A5276", accent: "#2E86C1",
  green:  "#1E8449", red:    "#C0392B", amber:  "#D4AC0D",
  gray:   "#566573", light:  "#EBF5FB", border: "#AED6F1",
  silver: "#F2F3F4", white:  "#FFFFFF", black:  "#1B2631",
};

function scoreColor(s) { return s >= 75 ? C.green : s >= 50 ? C.amber : C.red; }
function riskColor(r)   { return r === "low" ? C.green : r === "medium" ? C.amber : C.red; }

function hLine(doc, color = C.border) {
  doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor(color).lineWidth(0.4).stroke();
}

function sectionBar(doc, title) {
  const y = doc.y;
  doc.rect(40, y, 515, 18).fill(C.navy);
  doc.fontSize(8.5).fillColor(C.white).font("Helvetica-Bold")
     .text(`  ${title.toUpperCase()}`, 46, y + 4, { width: 505 });
  doc.y = y + 18;
  doc.moveDown(0.25);
}

function kvRow(doc, label, value, shade) {
  const y = doc.y;
  if (shade) doc.rect(40, y, 515, 15).fill(C.silver);
  doc.fontSize(8).fillColor(C.gray).font("Helvetica")
     .text(label, 48, y + 2, { width: 200 });
  doc.fontSize(8).fillColor(C.black).font("Helvetica")
     .text(String(value || "—"), 250, y + 2, { width: 295 });
  doc.y = y + 15;
}

function checkRow(doc, item, idx) {
  const y = doc.y;
  if (idx % 2 === 0) doc.rect(40, y, 515, 16).fill(C.silver);
  const icon  = item.status === "ok" ? "✔" : item.status === "warning" ? "▲" : "✘";
  const color = item.status === "ok" ? C.green : item.status === "warning" ? C.amber : C.red;
  const badge = item.assignedTo === "exporter" ? "EXPORTER" : "FORWARDER";
  const bc    = item.assignedTo === "exporter" ? C.blue : C.navy;

  doc.fontSize(9).fillColor(color).font("Helvetica-Bold").text(icon, 48, y + 3, { width: 14 });
  doc.fontSize(8).fillColor(C.black).font("Helvetica").text(item.task, 64, y + 3, { width: 310 });
  doc.rect(382, y + 2, 55, 12).fill(bc);
  doc.fontSize(6.5).fillColor(C.white).font("Helvetica-Bold")
     .text(badge, 384, y + 4, { width: 51, align: "center" });
  doc.fontSize(7.5).fillColor(color).font("Helvetica-Bold")
     .text(item.status.toUpperCase(), 444, y + 4, { width: 100 });
  doc.y = y + 16;
}

// ── COMPLIANCE REPORT ─────────────────────────────────────────────
async function generatePDFReport(shipment) {
  return new Promise((resolve, reject) => {
    const dir = path.join(__dirname, "../reports");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, `report-${shipment.shipmentId}.pdf`);
    const doc = new PDFDocument({ margin: 0, size: "A4" });
    doc.pipe(fs.createWriteStream(filePath).on("finish", () => resolve(filePath)).on("error", reject));

    const r   = shipment.complianceReport || {};
    const si  = shipment.shipmentInfo || {};
    const ed  = shipment.exporterDetails || {};
    const now = new Date();

    // ── HEADER ──────────────────────────────────────────────────
    doc.rect(0, 0, 595, 82).fill(C.navy);
    doc.rect(0, 82, 595, 5).fill(C.accent);
    doc.fontSize(18).fillColor(C.white).font("Helvetica-Bold").text("FREIGHTGENIE", 40, 18);
    doc.fontSize(8).fillColor(C.border).font("Helvetica")
       .text("International Trade Compliance Platform", 40, 42)
       .text("compliance@freightgenie.com", 40, 55);

    // Report badge top-right
    doc.rect(395, 12, 160, 60).fill(C.accent);
    doc.fontSize(8.5).fillColor(C.white).font("Helvetica-Bold")
       .text("COMPLIANCE REPORT", 400, 18, { width: 150, align: "center" });
    doc.fontSize(7.5).fillColor(C.white).font("Helvetica")
       .text(`Ref: ${shipment.shipmentId}`, 400, 34, { width: 150, align: "center" })
       .text(`Date: ${now.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}`, 400, 48, { width: 150, align: "center" });

    doc.y = 100;

    // ── SCORE STRIP ─────────────────────────────────────────────
    const sc = r.score || 0;
    doc.rect(40, doc.y, 515, 38).fill(C.light);
    // Score circle
    const cx = 110, cy = doc.y + 19;
    doc.circle(cx, cy, 16).fill(scoreColor(sc));
    doc.circle(cx, cy, 11).fill(C.white);
    doc.fontSize(10).fillColor(scoreColor(sc)).font("Helvetica-Bold")
       .text(`${sc}`, cx - 12, cy - 7, { width: 24, align: "center" });
    doc.fontSize(6.5).fillColor(C.gray).font("Helvetica")
       .text("/100", cx - 12, cy + 4, { width: 24, align: "center" });
    // Risk badge
    doc.rect(140, doc.y + 10, 60, 16).fill(riskColor(r.riskLevel || "high"));
    doc.fontSize(8).fillColor(C.white).font("Helvetica-Bold")
       .text((r.riskLevel || "—").toUpperCase(), 141, doc.y + 14, { width: 58, align: "center" });
    // Status
    doc.fontSize(8).fillColor(C.black).font("Helvetica")
       .text(`Status: ${(r.status || "—").replace("_"," ").toUpperCase()}`, 215, doc.y + 8)
       .text(`Generated: ${now.toLocaleString("en-IN")}`, 215, doc.y + 20);
    doc.y = doc.y + 38;
    doc.moveDown(0.4);

    // ── SHIPMENT INFO ────────────────────────────────────────────
    sectionBar(doc, "📦  Shipment Information");
    [
      ["Shipment Reference",  shipment.shipmentId],
      ["Product / Cargo",     shipment.product],
      ["Cargo Type",          shipment.cargoType?.toUpperCase()],
      ["Origin",              shipment.origin],
      ["Destination",         shipment.destination],
      ["Port of Loading",     si.portOfLoading],
      ["Port of Discharge",   si.portOfDischarge],
      ["Shipping Mode",       si.shippingMode?.toUpperCase()],
      ["Payment Terms",       si.paymentTerms],
      ["Expected Ship Date",  si.expectedShipDate ? new Date(si.expectedShipDate).toLocaleDateString("en-IN") : "—"],
    ].forEach((row, i) => kvRow(doc, row[0], row[1], i % 2 === 0));
    doc.moveDown(0.5);

    // ── EXPORTER DETAILS ─────────────────────────────────────────
    sectionBar(doc, "🏢  Exporter Details");
    [
      ["Exporter Name",       ed.name || shipment.exporterName],
      ["Company",             ed.company],
      ["Email",               shipment.exporterEmail],
      ["Phone",               ed.phone],
      ["GST / Tax Number",    ed.gstNumber],
      ["IEC Code",            ed.iecCode],
    ].forEach((row, i) => kvRow(doc, row[0], row[1], i % 2 === 0));
    doc.moveDown(0.5);

    // ── CONSIGNEE ────────────────────────────────────────────────
    sectionBar(doc, "🏭  Consignee (Buyer) Details");
    [
      ["Consignee Name",    si.consigneeName],
      ["Country",           si.consigneeCountry],
      ["Address",           si.consigneeAddress],
      ["Notify Party",      si.notifyParty],
    ].forEach((row, i) => kvRow(doc, row[0], row[1], i % 2 === 0));
    doc.moveDown(0.5);

    // ── CARGO / INVOICE ──────────────────────────────────────────
    sectionBar(doc, "📋  Cargo & Invoice Details");
    [
      ["Invoice Number",    ed.invoiceNumber],
      ["Invoice Value",     ed.invoiceValue ? `${ed.invoiceCurrency || "USD"} ${ed.invoiceValue}` : "—"],
      ["No. of Packages",   ed.packageCount],
      ["Gross Weight",      ed.grossWeight ? `${ed.grossWeight} KGS` : "—"],
      ["Net Weight",        ed.netWeight   ? `${ed.netWeight} KGS`   : "—"],
      ["Volume (CBM)",      ed.volume],
      ["HS Code",           r.hsCode || ed.hsCode || "AI Generated"],
    ].forEach((row, i) => kvRow(doc, row[0], row[1], i % 2 === 0));
    doc.moveDown(0.5);

    // ── DOCUMENT STATUS ──────────────────────────────────────────
    sectionBar(doc, "📄  Document Status");
    // Table header
    const th = doc.y;
    doc.rect(40, th, 515, 15).fill(C.blue);
    doc.fontSize(7.5).fillColor(C.white).font("Helvetica-Bold")
       .text("DOCUMENT / TASK", 48, th + 3, { width: 320 })
       .text("ASSIGNED TO", 375, th + 3, { width: 65 })
       .text("STATUS", 448, th + 3, { width: 100 });
    doc.y = th + 15;
    (r.checklist || []).forEach((item, i) => checkRow(doc, item, i));

    // Missing docs
    if (r.missingDocs?.length) {
      doc.moveDown(0.3);
      const my = doc.y;
      doc.rect(40, my, 515, 13 + r.missingDocs.length * 13).fill("#FDEDEC");
      doc.fontSize(8).fillColor(C.red).font("Helvetica-Bold")
         .text("  ✘  Missing Documents — Action Required:", 48, my + 3);
      r.missingDocs.forEach(d => {
        doc.fontSize(8).fillColor("#922B21").font("Helvetica").text(`     •  ${d}`, 48, doc.y);
      });
      doc.moveDown(0.4);
    }

    // Expiry alerts
    if (r.expiryAlerts?.length) {
      const ay = doc.y;
      doc.rect(40, ay, 515, 13 + r.expiryAlerts.length * 13).fill("#FEF9E7");
      doc.fontSize(8).fillColor(C.amber).font("Helvetica-Bold")
         .text("  ▲  Document Expiry Alerts:", 48, ay + 3);
      r.expiryAlerts.forEach(a => {
        doc.fontSize(8).fillColor("#7D6608").font("Helvetica")
           .text(`     •  ${a.doc}  —  Expires: ${a.date}`, 48, doc.y);
      });
      doc.moveDown(0.4);
    }
    doc.moveDown(0.3);

    // ── COST BREAKDOWN ───────────────────────────────────────────
    sectionBar(doc, "💰  Cost Estimation");
    [
      ["Ocean / Air Freight",          r.freightCost   || "TBD"],
      ["Customs Duty / Tariff",        r.dutyEstimate  || "TBD"],
      ["Handling & Documentation",     "As per tariff schedule"],
    ].forEach((row, i) => kvRow(doc, row[0], row[1], i % 2 === 0));
    hLine(doc, C.accent); doc.moveDown(0.1);
    // Total bold row
    const ty = doc.y;
    doc.rect(40, ty, 515, 18).fill(C.light);
    doc.fontSize(9).fillColor(C.navy).font("Helvetica-Bold")
       .text("TOTAL ESTIMATED LANDED COST", 48, ty + 4);
    doc.fontSize(9).fillColor(C.accent).font("Helvetica-Bold")
       .text(r.totalCost || "TBD", 400, ty + 4, { width: 145, align: "right" });
    doc.y = ty + 18;
    doc.moveDown(0.5);

    // ── EXECUTIVE SUMMARY ────────────────────────────────────────
    sectionBar(doc, "📋  Compliance Summary");
    const sy = doc.y;
    doc.rect(40, sy, 515, 44).fill(C.light);
    doc.fontSize(8.5).fillColor(C.black).font("Helvetica")
       .text(r.summary || "No summary available.", 48, sy + 6, { width: 500, lineGap: 3 });
    doc.y = sy + 44;
    doc.moveDown(0.3);

    if (r.regulatoryNotes) {
      const ry = doc.y;
      doc.rect(40, ry, 515, 28).fill("#FEF9E7");
      doc.fontSize(8).fillColor("#7D6608").font("Helvetica-Bold").text("⚠  Regulatory Note:", 48, ry + 4);
      doc.font("Helvetica").text(r.regulatoryNotes, 48, doc.y, { width: 500 });
      doc.moveDown(0.4);
    }

    // ── ISSUES ───────────────────────────────────────────────────
    if (r.issues?.length) {
      sectionBar(doc, "⚠  Issues Identified");
      r.issues.forEach((issue, i) => {
        const y = doc.y;
        if (i % 2 === 0) doc.rect(40, y, 515, 15).fill(C.silver);
        doc.fontSize(8).fillColor(C.red).font("Helvetica")
           .text(`  ✘  ${issue}`, 48, y + 2, { width: 505 });
        doc.y = y + 15;
      });
      doc.moveDown(0.3);
    }

    // ── RECOMMENDATIONS ──────────────────────────────────────────
    if (r.suggestions?.length) {
      sectionBar(doc, "✅  Recommendations");
      r.suggestions.forEach((s, i) => {
        const y = doc.y;
        if (i % 2 === 0) doc.rect(40, y, 515, 15).fill(C.silver);
        doc.fontSize(8).fillColor(C.green).font("Helvetica")
           .text(`  ✔  ${s}`, 48, y + 2, { width: 505 });
        doc.y = y + 15;
      });
      doc.moveDown(0.3);
    }

    // ── FOOTER ───────────────────────────────────────────────────
    const ph = doc.page.height;
    doc.rect(0, ph - 36, 595, 36).fill(C.navy);
    doc.fontSize(7).fillColor(C.border).font("Helvetica")
       .text(`FreightGenie Compliance Platform  |  Ref: ${shipment.shipmentId}  |  ${now.toLocaleString("en-IN")}`, 40, ph - 24, { width: 515, align: "center" });
    doc.fontSize(6.5).fillColor(C.gray)
       .text("CONFIDENTIAL — For authorized use only. Not a substitute for professional customs or legal advice.", 40, ph - 13, { width: 515, align: "center" });

    doc.end();
  });
}

// ── ANALYTICS CSV AUTO-SAVE ────────────────────────────────────────
function saveAnalyticsCSV(shipment) {
  try {
    const r  = shipment.complianceReport || {};
    const si = shipment.shipmentInfo || {};
    const ed = shipment.exporterDetails || {};
    const now = new Date();

    const row = {
      shipmentId:       shipment.shipmentId,
      date:             now.toISOString().split("T")[0],
      month:            now.toLocaleString("en-US", { month: "long" }),
      year:             now.getFullYear(),
      origin:           shipment.origin,
      destination:      shipment.destination,
      route:            `${shipment.origin} → ${shipment.destination}`,
      cargoType:        shipment.cargoType,
      hsCode:           r.hsCode || ed.hsCode || "",
      shippingMode:     si.shippingMode || "",
      paymentTerms:     si.paymentTerms || "",
      invoiceValue:     ed.invoiceValue || "",
      invoiceCurrency:  ed.invoiceCurrency || "USD",
      grossWeight_kg:   ed.grossWeight || "",
      volume_cbm:       ed.volume || "",
      packageCount:     ed.packageCount || "",
      freightCost:      r.freightCost || "",
      dutyEstimate:     r.dutyEstimate || "",
      totalCost:        r.totalCost || "",
      complianceScore:  r.score || 0,
      riskLevel:        r.riskLevel || "",
      totalDocs:        shipment.documents?.length || 0,
      missingDocsCount: r.missingDocs?.length || 0,
      issuesCount:      r.issues?.length || 0,
      status:           shipment.status,
    };

    const csvDir  = process.env.ANALYTICS_CSV_DIR
      ? path.resolve(process.env.ANALYTICS_CSV_DIR)
      : path.join(__dirname, "../analytics");
    const csvFile = path.join(csvDir, process.env.ANALYTICS_CSV_FILENAME || "shipment_analytics.csv");
    if (!fs.existsSync(csvDir)) fs.mkdirSync(csvDir, { recursive: true });

    const headers = Object.keys(row).join(",");
    const values  = Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(",");

    if (!fs.existsSync(csvFile)) {
      fs.writeFileSync(csvFile, headers + "\n" + values + "\n");
    } else {
      fs.appendFileSync(csvFile, values + "\n");
    }

    console.log(`📊 Analytics saved: ${shipment.shipmentId}`);
  } catch (err) {
    console.error("Analytics CSV save error:", err.message);
  }
}

module.exports = { generatePDFReport, saveAnalyticsCSV };
