import jsPDF from 'jspdf';

/**
 * Robust Base64 Image Loader
 * Bypasses pathing issues by drawing the image to an invisible canvas first.
 * Specifically handles GitHub Pages sub-directories.
 */
const getBase64ImageFromURL = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    
    // Logic to handle GitHub Pages sub-directory pathing
    const baseUrl = window.location.origin;
    const pathName = window.location.pathname.endsWith('/') 
      ? window.location.pathname.slice(0, -1) 
      : window.location.pathname;
    
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    const finalUrl = pathName.includes(cleanUrl) ? `${baseUrl}${cleanUrl}` : `${baseUrl}${pathName}${cleanUrl}`;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas context failed');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(`Failed to load logo at ${finalUrl}. Ensure logo.png is in the public folder.`);
    img.src = finalUrl;
  });
};

/**
 * Helper to capitalize names (e.g., "john doe" -> "John Doe")
 * Used to ensure certificates look professional even if user input was lowercase.
 */
const formatTitleCase = (str: string) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Generates the GBC Certificate
 * @param userName - The full name of the staff member
 * @param score - The quiz score percentage
 * @param lastPassDate - The date the test was actually passed (from Firestore)
 */
export const generateCertificate = async (userName: string, score: number, lastPassDate: string | Date) => {
  // --- PRE-PROCESSING ---
  const formattedName = formatTitleCase(userName);

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // --- STYLING CONSTANTS ---
  const GOLD = '#D4AF37';
  const PRIMARY_GREEN = '#2E5D4E';   // Dark Green
  const FIRE_ENGINE_RED = '#CE2029'; // Fire Engine Red
  const DARK_GREY = '#333333';
  const LIGHT_GREY_BG = '#F9F9F9';
  const A4_WIDTH = 297;
  const A4_HEIGHT = 210;
  const MARGIN = 15;

  // --- DATE LOGIC (1 YEAR VALIDITY FROM PASS DATE) ---
  const issueDate = new Date(lastPassDate);
  const expiryDate = new Date(issueDate);
  expiryDate.setDate(issueDate.getDate() + 365); // Add exactly 365 days

  const dateStr = issueDate.toLocaleDateString('en-GB'); // DD/MM/YYYY
  const expiryStr = expiryDate.toLocaleDateString('en-GB');

  // Background
  doc.setFillColor(LIGHT_GREY_BG);
  doc.rect(0, 0, A4_WIDTH, A4_HEIGHT, 'F');

  // Borders
  doc.setDrawColor(GOLD);
  doc.setLineWidth(1.5);
  doc.rect(MARGIN, MARGIN, A4_WIDTH - MARGIN * 2, A4_HEIGHT - MARGIN * 2);

  doc.setDrawColor(PRIMARY_GREEN);
  doc.setLineWidth(0.5);
  doc.rect(MARGIN - 1, MARGIN - 1, A4_WIDTH - (MARGIN - 1) * 2, A4_HEIGHT - (MARGIN - 1) * 2);

  // Logo Rendering
  const logoSize = 50;
  try {
    const logoBase64 = await getBase64ImageFromURL('logo.png');
    doc.addImage(logoBase64, 'PNG', (A4_WIDTH / 2) - (logoSize / 2), 25, logoSize, logoSize);
  } catch (e) {
    console.error("Certificate logo not found.", e);
    doc.setDrawColor(DARK_GREY);
    doc.rect((A4_WIDTH / 2) - (logoSize / 2), 25, logoSize, logoSize);
    doc.text("GBC LOGO", A4_WIDTH / 2, 50, { align: 'center' });
  }

  // Text Content
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

  // PRINT FORMATTED NAME
  doc.setFont('times', 'italic');
  doc.setFontSize(36);
  doc.setTextColor(GOLD);
  doc.text(formattedName, A4_WIDTH / 2, 132, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(DARK_GREY);
  doc.text(
    `Has successfully completed the Child Protection Policy Training with a score of ${score}%.`,
    A4_WIDTH / 2, 145, { align: 'center' }
  );

  const footerY = 175;
  doc.setFontSize(11);
  doc.setTextColor(DARK_GREY);
  doc.text(`Date Issued: ${dateStr}`, MARGIN + 10, footerY);

  doc.setLineWidth(0.3);
  doc.line(A4_WIDTH / 2 - 35, footerY - 2, A4_WIDTH / 2 + 35, footerY - 2);
  doc.text('Church Leadership', A4_WIDTH / 2, footerY + 2, { align: 'center' });

  doc.setTextColor(FIRE_ENGINE_RED); 
  doc.text(`Valid Until: ${expiryStr}`, A4_WIDTH - MARGIN - 50, footerY);

  doc.setTextColor(DARK_GREY);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text('Renewal is required annually on or before the 1st anniversary.', A4_WIDTH / 2, A4_HEIGHT - MARGIN - 5, { align: 'center' });

  return doc.output('datauristring');
};