import jsPDF from 'jspdf';

// --- HELPER TO CONVERT LOGO TO BASE64 ---
const getBase64ImageFromURL = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = error => reject(error);
    img.src = url;
  });
};


// Note: jsPDF doesn't support custom fonts in this environment without font files.
// We will use 'times' in italic style to simulate a cursive/formal look.

export const generateCertificate = async (userName: string, score: number, lastSuccessfulDate: Date) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // --- STYLING CONSTANTS ---
  const GOLD = '#D4AF37';
  const PRIMARY_GREEN = '#2E5D4E';
  const DARK_GREY = '#333333';
  const LIGHT_GREY_BG = '#F9F9F9';
  const A4_WIDTH = 297;
  const A4_HEIGHT = 210;
  const MARGIN = 15;

  // --- DATES (Policy requires 1-year validity from last pass) ---
  const today = new Date(); // Date of generation
  const expiryDate = new Date(lastSuccessfulDate); // Start from the successful date
  expiryDate.setDate(expiryDate.getDate() + 365); // Add 365 days
  const dateStr = today.toLocaleDateString('en-GB');
  const expiryStr = expiryDate.toLocaleDateString('en-GB');

  // --- DOCUMENT BACKGROUND ---
  doc.setFillColor(LIGHT_GREY_BG);
  doc.rect(0, 0, A4_WIDTH, A4_HEIGHT, 'F');

  // --- ORNATE BORDER ---
  doc.setDrawColor(GOLD);
  doc.setLineWidth(1.5);
  doc.rect(MARGIN, MARGIN, A4_WIDTH - MARGIN * 2, A4_HEIGHT - MARGIN * 2);

  doc.setDrawColor(PRIMARY_GREEN);
  doc.setLineWidth(0.5);
  doc.rect(MARGIN - 1, MARGIN - 1, A4_WIDTH - (MARGIN - 1) * 2, A4_HEIGHT - (MARGIN - 1) * 2);

  // --- LOGO (LARGE & CENTERED) ---
  const logoSize = 50;
  try {
    const logoData = await getBase64ImageFromURL('/logo.png');
    doc.addImage(logoData, 'PNG', (A4_WIDTH / 2) - (logoSize / 2), 25, logoSize, logoSize);
  } catch (e) {
    console.error("Certificate logo not found or failed to load. Ensure /public/logo.png exists.", e);
    // Draw a placeholder if logo fails
    doc.setDrawColor(DARK_GREY);
    doc.rect((A4_WIDTH / 2) - (logoSize / 2), 25, logoSize, logoSize);
    doc.text("LOGO", A4_WIDTH / 2, 50, { align: 'center' });
  }

  // --- HEADER TEXT ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(PRIMARY_GREEN);
  doc.text('GERMISTON BAPTIST CHURCH', A4_WIDTH / 2, 85, { align: 'center' });

  doc.setFontSize(20);
  doc.setTextColor(DARK_GREY);
  doc.text('Certificate of Achievement', A4_WIDTH / 2, 98, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(16);
  doc.text('This is to certify that', A4_WIDTH / 2, 115, { align: 'center' });

  // --- USER NAME (CURSIVE STYLE) ---
  doc.setFont('times', 'italic');
  doc.setFontSize(36);
  doc.setTextColor(GOLD);
  doc.text(userName, A4_WIDTH / 2, 132, { align: 'center' });

  // --- DESCRIPTION TEXT ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(DARK_GREY);
  doc.text(
    `Has successfully completed the Child Protection Policy Training with a score of ${score}%.`,
    A4_WIDTH / 2, 145, { align: 'center' }
  );

  // --- DATES & SIGNATURE ---
  const footerY = 175;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(DARK_GREY);

  // Date Issued
  doc.text(`Date Issued: ${dateStr}`, MARGIN + 10, footerY);

  // Signature Line
  doc.setLineWidth(0.3);
  doc.setDrawColor(DARK_GREY);
  doc.line(A4_WIDTH / 2 - 35, footerY - 2, A4_WIDTH / 2 + 35, footerY - 2);
  doc.text('Church Leadership', A4_WIDTH / 2, footerY + 2, { align: 'center' });

  // Expiry Date
  doc.setTextColor('#C00000'); // Red for expiry
  doc.text(`Valid Until: ${expiryStr}`, A4_WIDTH - MARGIN - 50, footerY);


  // --- FOOTER NOTE ---
  doc.setTextColor(DARK_GREY);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text('Renewal is required annually on or before the 1st anniversary.', A4_WIDTH / 2, A4_HEIGHT - MARGIN - 5, { align: 'center' });

  // --- RETURN DOCUMENT ---
  doc.save('certificate.pdf');
};
