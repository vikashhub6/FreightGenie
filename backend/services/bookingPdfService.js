const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const C = {
  navy:   "#0B2545", blue:   "#1A5276", accent: "#2E86C1",
  green:  "#1E8449", silver: "#F2F3F4", light:  "#EBF5FB",
  border: "#AED6F1", white:  "#FFFFFF", black:  "#1B2631",
  gray:   "#566573",
};

function kvRow(doc, label, value, shade) {
  const y = doc.y;
  if (shade) doc.rect(40, y, 515, 15).fill(C.silver);
  doc.fontSize(8).fillColor(C.gray).font("Helvetica").text(label, 48, y+2, { width: 180 });
  doc.fontSize(8).fillColor(C.black).font("Helvetica").text(String(value||"—"), 235, y+2, { width: 310 });
  doc.y = y + 15;
}

function sectionBar(doc, title) {
  const y = doc.y;
  doc.rect(40, y, 515, 18).fill(C.navy);
  doc.fontSize(8.5).fillColor(C.white).font("Helvetica-Bold").text(`  ${title}`, 46, y+4, { width: 505 });
  doc.y = y + 18; doc.moveDown(0.25);
}

async function generateBookingConfirmation(shipment) {
  return new Promise((resolve, reject) => {
    const dir = path.join(__dirname, "../reports");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, `booking-${shipment.shipmentId}.pdf`);
    const doc = new PDFDocument({ margin: 0, size: "A4" });
    doc.pipe(fs.createWriteStream(filePath).on("finish", () => resolve(filePath)).on("error", reject));

    const si  = shipment.shipmentInfo || {};
    const now = new Date();

    // ── HEADER ──
    doc.rect(0, 0, 595, 82).fill(C.navy);
    doc.rect(0, 82, 595, 5).fill(C.accent);
    doc.fontSize(18).fillColor(C.white).font("Helvetica-Bold").text("FREIGHTGENIE", 40, 18);
    doc.fontSize(8).fillColor(C.border).font("Helvetica")
       .text("International Freight Forwarding", 40, 42)
       .text("bookings@freightgenie.com", 40, 55);

    doc.rect(395, 12, 160, 60).fill(C.accent);
    doc.fontSize(8.5).fillColor(C.white).font("Helvetica-Bold")
       .text("BOOKING CONFIRMATION", 400, 18, { width: 150, align: "center" });
    doc.fontSize(7.5).fillColor(C.white).font("Helvetica")
       .text(`Ref: ${shipment.shipmentId}`, 400, 34, { width: 150, align: "center" })
       .text(`Date: ${now.toLocaleDateString("en-IN", {day:"2-digit",month:"short",year:"numeric"})}`, 400, 48, { width: 150, align: "center" });
    doc.y = 100; doc.moveDown(0.5);

    // ── STATUS BANNER ──
    doc.rect(40, doc.y, 515, 22).fill(C.green);
    doc.fontSize(10).fillColor(C.white).font("Helvetica-Bold")
       .text("✔  BOOKING CONFIRMED — Shipment Successfully Registered", 48, doc.y+5, { width: 505 });
    doc.y = doc.y + 22; doc.moveDown(0.5);

    // ── SHIPMENT INFO ──
    sectionBar(doc, "📦  SHIPMENT DETAILS");
    [
      ["Booking Reference",   shipment.shipmentId],
      ["Booking Date",        now.toLocaleDateString("en-IN", {day:"2-digit",month:"long",year:"numeric"})],
      ["Product Description", shipment.product],
      ["Cargo Type",          shipment.cargoType?.toUpperCase()],
      ["Shipping Mode",       si.shippingMode?.toUpperCase() || "SEA"],
      ["Payment Terms",       si.paymentTerms || "FOB"],
      ["Special Instructions",si.specialInstructions || "None"],
    ].forEach((r,i) => kvRow(doc, r[0], r[1], i%2===0));
    doc.moveDown(0.5);

    // ── ROUTING ──
    sectionBar(doc, "🚢  ROUTING & SCHEDULE");
    [
      ["Port of Loading",     si.portOfLoading  || shipment.origin],
      ["Port of Discharge",   si.portOfDischarge|| shipment.destination],
      ["Origin Country",      shipment.origin],
      ["Destination Country", shipment.destination],
      ["Expected Ship Date",  si.expectedShipDate ? new Date(si.expectedShipDate).toLocaleDateString("en-IN") : "To be confirmed"],
      ["Estimated Arrival",   si.eta ? new Date(si.eta).toLocaleDateString("en-IN") : "To be confirmed"],
    ].forEach((r,i) => kvRow(doc, r[0], r[1], i%2===0));
    doc.moveDown(0.5);

    // ── SHIPPER ──
    sectionBar(doc, "🏢  SHIPPER (EXPORTER)");
    [
      ["Exporter Name",    shipment.exporterName || "To be confirmed"],
      ["Email",            shipment.exporterEmail],
      ["Exporter PIN",     shipment.exporterPin],
    ].forEach((r,i) => kvRow(doc, r[0], r[1], i%2===0));
    doc.moveDown(0.5);

    // ── CONSIGNEE ──
    sectionBar(doc, "🏭  CONSIGNEE (BUYER)");
    [
      ["Consignee Name",    si.consigneeName    || "To be confirmed"],
      ["Country",           si.consigneeCountry || "To be confirmed"],
      ["Address",           si.consigneeAddress || "To be confirmed"],
      ["Notify Party",      si.notifyParty      || si.consigneeName || "Same as Consignee"],
    ].forEach((r,i) => kvRow(doc, r[0], r[1], i%2===0));
    doc.moveDown(0.5);

    // ── NEXT STEPS ──
    sectionBar(doc, "📋  NEXT STEPS — ACTION REQUIRED");
    const steps = [
      "Exporter to submit all required documents via the secure upload link sent to registered email",
      "Required: Commercial Invoice, Packing List, Certificate of Origin, IEC Certificate",
      "Documents must be submitted minimum 5 working days before cargo cutoff date",
      "FreightGenie compliance team will review documents within 24-48 hours",
      "Compliance report will be emailed once analysis is complete",
    ];
    steps.forEach((s, i) => {
      const y = doc.y;
      if (i%2===0) doc.rect(40, y, 515, 15).fill(C.light);
      doc.fontSize(8).fillColor(C.black).font("Helvetica").text(`  ${i+1}.  ${s}`, 48, y+2, { width: 505 });
      doc.y = y + 15;
    });
    doc.moveDown(0.5);

    // ── FOOTER ──
    const ph = doc.page.height;
    doc.rect(0, ph-36, 595, 36).fill(C.navy);
    doc.fontSize(7).fillColor(C.border).font("Helvetica")
       .text(`FreightGenie  |  Booking Ref: ${shipment.shipmentId}  |  ${now.toLocaleString("en-IN")}`, 40, ph-24, { width: 515, align: "center" });
    doc.fontSize(6.5).fillColor(C.gray)
       .text("This is a system-generated booking confirmation. Subject to carrier space availability and document compliance.", 40, ph-13, { width: 515, align: "center" });

    doc.end();
  });
}

module.exports = { generateBookingConfirmation };
