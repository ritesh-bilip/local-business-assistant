import jsPDF from "jspdf";

type Options = {
  title: string;
  subtitle?: string;
  body: string;
  businessName?: string;
};

export function exportProposalPdf({ title, subtitle, body, businessName }: Options) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  // Header band
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, pageWidth, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, 20);

  if (businessName) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(businessName, pageWidth - margin, 20, { align: "right" });
  }

  y = 45;
  doc.setTextColor(17, 24, 39);

  if (subtitle) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(subtitle, margin, y);
    y += 8;
  }

  doc.setFontSize(11);
  doc.setTextColor(31, 41, 55);
  doc.setFont("helvetica", "normal");

  const lines = doc.splitTextToSize(body, contentWidth);
  const lineHeight = 6;

  for (const line of lines) {
    if (y > pageHeight - margin - 10) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  const safe = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60);
  doc.save(`${safe || "proposal"}.pdf`);
}