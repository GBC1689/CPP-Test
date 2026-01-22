import jsPDF from 'jspdf';

export const generateCertificate = (userName: string, score: number) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const today = new Date();
  const expiryDate = new Date();
  expiryDate.setFullYear(today.getFullYear() + 1);

  const dateStr = today.toLocaleDateString('en-GB');
  const expiryStr = expiryDate.toLocaleDateString('en-GB');

  doc.setLineWidth(2);
  doc.rect(10, 10, 277, 190);
  doc.setLineWidth(0.5);
  doc.rect(13, 13, 271, 184);

  try {
    doc.addImage('/logo.png', 'PNG', 123, 20, 50, 50);
  } catch (e) {
    console.error("Logo not found");
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(0, 51, 102);
  doc.text('GERMISTON BAPTIST CHURCH', 148, 85, { align: 'center' });

  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text('Child Protection Policy Training', 148, 98, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(16);
  doc.text('This certificate is proudly awarded to:', 148, 115, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text(userName.toUpperCase(), 148, 130, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.text(`Successfully completed the annual assessment with a score of ${score}%`, 148, 145, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`Date Issued: ${dateStr}`, 60, 170, { align: 'center' });
  doc.setTextColor(200, 0, 0);
  doc.text(`Valid Until: ${expiryStr}`, 230, 170, { align: 'center' });

  doc.setTextColor(100);
  doc.setFontSize(10);
  doc.text('Annual renewal is required for active volunteer status.', 148, 185, { align: 'center' });

  doc.save(`${userName.replace(/\s+/g, '_')}_GBC_Certificate.pdf`);
};
