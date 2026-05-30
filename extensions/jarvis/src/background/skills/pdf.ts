import { jsPDF } from 'jspdf';

export interface PdfOptions {
  title: string;
  content: string;
  author?: string;
  sections?: { heading: string; body: string }[];
}

export function generatePdf(opts: PdfOptions): Blob {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  doc.setFillColor(7, 7, 24);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(124, 110, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('JARVIS AI — Report', 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(160, 160, 200);
  doc.text(`Generated: ${dateStr} at ${timeStr}${opts.author ? ` | Author: ${opts.author}` : ''}`, 14, 24);

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(opts.title.substring(0, 80), 14, 44);

  let y = 54;

  if (opts.sections && opts.sections.length > 0) {
    for (const section of opts.sections) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(124, 110, 255);
      doc.text(section.heading, 14, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(section.body, 180);
      for (const line of lines) {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(line, 14, y);
        y += 5.5;
      }
      y += 4;
    }
  } else if (opts.content) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(opts.content, 180);
    for (const line of lines) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line, 14, y);
      y += 5.5;
    }
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 180);
    doc.text(`JARVIS AI v4.0 | Page ${i} of ${pageCount}`, 14, 290);
    doc.text('Sovereign Organism Platform', 140, 290);
  }

  return doc.output('blob');
}

export function downloadPdf(opts: PdfOptions, filename?: string): void {
  const blob = generatePdf(opts);
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({
    url,
    filename: filename || `jarvis-report-${Date.now()}.pdf`,
    saveAs: false,
  }, () => {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}
