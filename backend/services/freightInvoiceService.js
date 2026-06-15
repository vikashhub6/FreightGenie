const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const C = {
  navy:   "#0B2545", blue:   "#1A5276", accent: "#2E86C1",
  green:  "#1E8449", silver: "#F2F3F4", light:  "#EBF5FB",
  border: "#AED6F1", white:  "#FFFFFF", black:  "#1B2631",
  gray:   "#566573", red:    "#C0392B",
};

function sectionBar(doc, title) {
  const y = doc.y;
  doc.rect(40, y, 515, 18).fill(C.navy);
  doc.fontSize(8.5).fillColor(C.white).font("Helvetica-Bold").text(`  ${title}`, 46, y+4, { width: 505 });
  doc.y = y + 18; doc.moveDown(0.25);
}

function chargeRow(doc, desc, amount, shade, bold) {
  const y = doc.y;
  if (shade) doc.rect(40, y, 515, 16).fill(C.silver);
  doc.fontSize(bold ? 9 : 8.5)
     .fillColor(bold ? C.navy : C.black)
     .font(bold ? "Helvetica-Bold" : "Helvetica")
     .text(desc, 48, y+2, { width: 380 });
  doc.font(bold ? "Helvetica-Bold" : "Helvetica")
     .fillColor(bold ? C.accent : C.black)
     .text(amount, 390, y+2, { width: 155, align: "right" });
  doc.y = y + 16;
}

async function generateFreightInvoice(shipment) {
  return new Promise((resolve, reject) => {
    const dir = path.join(__dirname, "../reports");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, `invoice-${shipment.shipmentId}.pdf`);
    const doc = new PDFDocument({ margin: 0, size: "A4" });
    doc.pipe(fs.createWriteStream(filePath).on("finish", () => resolve(filePath)).on("error", reject));

    const r   = shipment.complianceReport || {};
    const si  = shipment.shipmentInfo || {};
    const ed  = shipment.exporterDetails || {};
    const now = new Date();
    const invNo = `FGI-${shipment.shipmentId}-${now.getFullYear()}`;

    // ── HEADER ──
    doc.rect(0, 0, 595, 82).fill(C.navy);
    doc.rect(0, 82, 595, 5).fill(C.accent);
    doc.fontSize(18).fillColor(C.white).font("Helvetica-Bold").text("FREIGHTGENIE", 40, 18);
    doc.fontSize(8).fillColor(C.border).font("Helvetica")
       .text("International Freight Forwarding", 40, 42)
       .text("accounts@freightgenie.com", 40, 55);

    doc.rect(395, 12, 160, 60).fill(C.accent);
    doc.fontSize(9).fillColor(C.white).font("Helvetica-Bold")
       .text("FREIGHT INVOICE", 400, 18, { width: 150, align: "center" });
    doc.fontSize(7.5).fillColor(C.white).font("Helvetica")
       .text(`Invoice No: ${invNo}`, 400, 34, { width: 150, align: "center" })
       .text(`Date: ${now.toLocaleDateString("en-IN", {day:"2-digit",month:"short",year:"numeric"})}`, 400, 48, { width: 150, align: "center" });
    doc.y = 100; doc.moveDown(0.5);

    // ── BILLED TO ──
    sectionBar(doc, "🧾  BILLED TO");
    const by = doc.y;
    doc.rect(40, by, 255, 60).fill(C.light);
    doc.rect(300, by, 255, 60).fill(C.silver);
    doc.fontSize(8).fillColor(C.gray).font("Helvetica")
       .text("EXPORTER / SHIPPER", 48, by+5)
       .text("CONSIGNEE / BUYER", 308, by+5);
    doc.fontSize(8.5).fillColor(C.black).font("Helvetica-Bold")
       .text(ed.company || shipment.exporterName || "—", 48, by+18)
       .text(si.consigneeName || "—", 308, by+18);
    doc.fontSize(8).font("Helvetica").fillColor(C.black)
       .text(shipment.exporterEmail, 48, by+32)
       .text(si.consigneeCountry || "—", 308, by+32)
       .text(`IEC: ${ed.iecCode || "—"}`, 48, by+44)
       .text(`GST: ${ed.gstNumber || "—"}`, 48, by+54);
    doc.y = by + 68; doc.moveDown(0.5);

    // ── SHIPMENT REFERENCE ──
    sectionBar(doc, "📦  SHIPMENT REFERENCE");
    [
      ["Booking Reference",   shipment.shipmentId],
      ["Invoice Reference",   ed.invoiceNumber || "—"],
      ["Product",             shipment.product],
      ["HS Code",             r.hsCode || "—"],
      ["Route",               `${si.portOfLoading || shipment.origin}  →  ${si.portOfDischarge || shipment.destination}`],
      ["Shipping Mode",       si.shippingMode?.toUpperCase() || "SEA"],
      ["Payment Terms",       si.paymentTerms || "FOB"],
      ["Gross Weight",        ed.grossWeight ? `${ed.grossWeight} KGS` : "—"],
      ["Volume",              ed.volume ? `${ed.volume} CBM` : "—"],
      ["Packages",            ed.packageCount || "—"],
    ].forEach((row, i) => {
      const y = doc.y;
      if (i%2===0) doc.rect(40, y, 515, 15).fill(C.silver);
      doc.fontSize(8).fillColor(C.gray).font("Helvetica").text(row[0], 48, y+2, { width: 200 });
      doc.fontSize(8).fillColor(C.black).text(String(row[1]||"—"), 255, y+2, { width: 290 });
      doc.y = y + 15;
    });
    doc.moveDown(0.5);

    // ── CHARGES TABLE ──
    sectionBar(doc, "💰  CHARGES BREAKDOWN");
    // Table header
    const th = doc.y;
    doc.rect(40, th, 515, 16).fill(C.blue);
    doc.fontSize(8).fillColor(C.white).font("Helvetica-Bold")
       .text("DESCRIPTION", 48, th+3, { width: 350 })
       .text("AMOUNT", 390, th+3, { width: 155, align: "right" });
    doc.y = th + 16;

    chargeRow(doc, "Ocean / Air Freight Charges",    r.freightCost   || "TBD", false, false);
    chargeRow(doc, "Origin Handling Charges (OHC)",  "As per tariff", true,  false);
    chargeRow(doc, "Bill of Lading / AWB Fee",       "USD 50",        false, false);
    chargeRow(doc, "Documentation Charges",          "INR 2,500",     true,  false);
    chargeRow(doc, "Customs Agency Charges",         "INR 5,000",     false, false);
    chargeRow(doc, "Port / Terminal Handling (THC)", "As applicable", true,  false);
    chargeRow(doc, "Miscellaneous / Communication",  "INR 500",       false, false);

    // Divider
    doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor(C.accent).lineWidth(0.5).stroke();
    doc.moveDown(0.1);

    // Total
    const ty = doc.y;
    doc.rect(40, ty, 515, 20).fill(C.light);
    doc.fontSize(10).fillColor(C.navy).font("Helvetica-Bold").text("  TOTAL ESTIMATED CHARGES", 48, ty+4);
    doc.fontSize(10).fillColor(C.accent).font("Helvetica-Bold")
       .text(r.totalCost || "To be confirmed", 390, ty+4, { width: 155, align: "right" });
    doc.y = ty + 20;
    doc.moveDown(0.5);

    // Note
    const ny = doc.y;
    doc.rect(40, ny, 515, 28).fill("#FEF9E7");
    doc.fontSize(7.5).fillColor("#7D6608").font("Helvetica-Bold").text("  NOTE:", 48, ny+4);
    doc.font("Helvetica").text("Above charges are estimates based on current tariffs. Final invoice will be issued after shipment completion. Additional charges may apply based on actual weight/volume.", 48, doc.y, { width: 505 });
    doc.moveDown(0.6);

    // ── BANK DETAILS ──
    sectionBar(doc, "🏦  PAYMENT DETAILS");
    const bd = doc.y;
    doc.rect(40, bd, 515, 55).fill(C.light);
    doc.fontSize(8.5).fillColor(C.navy).font("Helvetica-Bold").text("  Payment to be made within 3 working days of invoice date.", 48, bd+6);
    doc.fontSize(8).fillColor(C.black).font("Helvetica")
       .text("Bank: FreightGenie Banking Partner", 48, bd+20)
       .text("Account: XXXX-XXXX-XXXX  |  IFSC: XXXXXX", 48, bd+32)
       .text("Reference: Please quote Booking Ref " + shipment.shipmentId, 48, bd+44);
    doc.y = bd + 62;

    // ── FOOTER ──
    const ph = doc.page.height;
    doc.rect(0, ph-36, 595, 36).fill(C.navy);
    doc.fontSize(7).fillColor(C.border).font("Helvetica")
       .text(`FreightGenie  |  Invoice: ${invNo}  |  Booking: ${shipment.shipmentId}  |  ${now.toLocaleString("en-IN")}`, 40, ph-24, { width: 515, align: "center" });
    doc.fontSize(6.5).fillColor(C.gray)
       .text("This is a system-generated freight invoice. For disputes contact accounts@freightgenie.com within 48 hours.", 40, ph-13, { width: 515, align: "center" });

    doc.end();
  });
}

module.exports = { generateFreightInvoice };
