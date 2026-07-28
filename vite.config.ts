import jsPDF from 'jspdf';
import { PDFData } from '../types';

export type PDFTheme = 'indigo' | 'corporate' | 'academic' | 'emerald' | 'mono';

export const PDF_THEME_OPTIONS: { id: PDFTheme; name: string }[] = [
  { id: 'indigo', name: 'Modern Indigo' },
  { id: 'corporate', name: 'Corporate Navy' },
  { id: 'academic', name: 'Academic Report' },
  { id: 'emerald', name: 'Emerald Fresh' },
  { id: 'mono', name: 'Clean Mono' },
];

const PDF_THEMES: Record<PDFTheme, { primary: number[]; dark: number[]; muted: number[]; summaryBg: number[] }> = {
  indigo:    { primary: [99, 102, 241],  dark: [30, 41, 59],  muted: [100, 116, 139], summaryBg: [248, 250, 252] },
  corporate: { primary: [30, 58, 95],    dark: [26, 32, 44],  muted: [100, 116, 139], summaryBg: [240, 244, 248] },
  academic:  { primary: [107, 33, 33],   dark: [40, 40, 40],  muted: [107, 107, 107], summaryBg: [250, 247, 242] },
  emerald:   { primary: [5, 122, 85],    dark: [22, 43, 38],  muted: [90, 122, 110],  summaryBg: [240, 250, 246] },
  mono:      { primary: [30, 30, 30],    dark: [20, 20, 20],  muted: [110, 110, 110], summaryBg: [245, 245, 245] },
};

export function downloadPDF(pdfData: PDFData, theme: PDFTheme = 'indigo') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let cursorY = 25;

  const themeColors = PDF_THEMES[theme] || PDF_THEMES.indigo;
  const primaryColor = themeColors.primary;
  const darkTextColor = themeColors.dark;
  const mutedTextColor = themeColors.muted;

  // Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 12, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text(pdfData.title, margin, cursorY);
  cursorY += 8;

  // Subtitle
  if (pdfData.subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
    doc.text(pdfData.subtitle, margin, cursorY);
    cursorY += 10;
  }

  // Metadata Line (Author & Date)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`BY: ${pdfData.author.toUpperCase()} | DATE: ${pdfData.date.toUpperCase()}`, margin, cursorY);
  cursorY += 6;

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 10;

  // Executive Summary Box
  if (pdfData.summary) {
    doc.setFillColor(themeColors.summaryBg[0], themeColors.summaryBg[1], themeColors.summaryBg[2]);
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.8);

    const summaryLines = doc.splitTextToSize(pdfData.summary, pageWidth - margin * 2 - 8);
    const boxHeight = summaryLines.length * 5 + 14;

    doc.rect(margin, cursorY, pageWidth - margin * 2, boxHeight, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('EXECUTIVE SUMMARY', margin + 5, cursorY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.text(summaryLines, margin + 5, cursorY + 13);

    cursorY += boxHeight + 12;
  }

  // Sections
  if (pdfData.sections && pdfData.sections.length > 0) {
    for (const section of pdfData.sections) {
      // Check page overflow
      if (cursorY > pageHeight - 40) {
        doc.addPage();
        cursorY = 25;
      }

      // Section Heading
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(section.heading, margin, cursorY);
      cursorY += 7;

      // Section Content
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
      const contentLines = doc.splitTextToSize(section.content, pageWidth - margin * 2);
      doc.text(contentLines, margin, cursorY);
      cursorY += contentLines.length * 5 + 4;

      // Bullet points
      if (section.bulletPoints && section.bulletPoints.length > 0) {
        for (const bp of section.bulletPoints) {
          if (cursorY > pageHeight - 30) {
            doc.addPage();
            cursorY = 25;
          }
          doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.circle(margin + 3, cursorY - 1.5, 1, 'F');

          const bpLines = doc.splitTextToSize(bp, pageWidth - margin * 2 - 8);
          doc.text(bpLines, margin + 8, cursorY);
          cursorY += bpLines.length * 5 + 2;
        }
      }

      cursorY += 6;
    }
  }

  // Conclusion
  if (pdfData.conclusion) {
    if (cursorY > pageHeight - 40) {
      doc.addPage();
      cursorY = 25;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('CONCLUSION', margin, cursorY);
    cursorY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    const concLines = doc.splitTextToSize(pdfData.conclusion, pageWidth - margin * 2);
    doc.text(concLines, margin, cursorY);
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
    doc.text(`Generated by BuildMate AI - Page ${i} of ${totalPages}`, margin, pageHeight - 10);
    doc.text(`buildmate.ai`, pageWidth - margin - 20, pageHeight - 10);
  }

  // Download PDF file
  const fileName = `${pdfData.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_report.pdf`;
  doc.save(fileName);
}
