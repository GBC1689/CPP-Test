import jsPDF from 'jspdf';

/**
 * Robust Base64 Image Loader
 * Bypasses pathing issues by drawing the image to an invisible canvas first.
 */
const getBase64ImageFromURL = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    
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
    img.onerror = () => reject(`Failed to load logo at ${finalUrl}.`);
    img.src = finalUrl;
  });
};

const formatTitleCase = (str: string) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const generateCertificate = async (userName: string, score: number, lastPassDate: string | Date) => {
  const formattedName = formatTitleCase(userName);

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // --- STYLING CONSTANTS ---
  const GOLD = '#D4AF37';
  const PRIMARY_GREEN = '#2E5D4E';   
  const FIRE_ENGINE_RED = '#CE2029'; 
  const DARK_GREY = '#333333';
  const LIGHT_GREY_BG = '#F9F9F9';
  const A4_WIDTH = 297;
  const A4_HEIGHT = 210;
  const MARGIN = 15;

  const issueDate = new Date(lastPassDate);
  const expiryDate = new Date(issueDate);
  expiryDate.setDate(issueDate.getDate() + 365);

  const dateStr = issueDate.toLocaleDateString('en-GB'); 
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

  // --- LOGO RENDERING (DOUBLED SIZE) ---
  const targetWidth = 150; // Doubled from 75
  let currentY = 20;

  try {
    const logoBase64 = await getBase64ImageFromURL('logo.png');
    const imgProps = doc.getImageProperties(logoBase64);
    
    const ratio = imgProps.width / imgProps.height;
    const targetHeight = targetWidth / ratio;

    doc.addImage(
      logoBase64, 
      'PNG', 
      (A4_WIDTH / 2) - (targetWidth / 2), 
      currentY, 
      targetWidth, 
      targetHeight
    );
    
    // Adjust currentY to be below the new larger logo (Logo bottom + spacing)
    currentY += targetHeight + 10; 
  } catch (e) {
    console.error("Certificate logo error.", e);
    currentY += 40; // Fallback spacing
  }

  // --- TEXT CONTENT (REPOSITIONED BASED ON LOGO SIZE) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(PRIMARY_GREEN);
  doc.text('GERMISTON BAPTIST CHURCH', A4_WIDTH / 2, currentY, { align: 'center' });

  doc.setFontSize(22);
  doc.setTextColor(DARK_GREY);
  doc.text('Certificate of Achievement', A4_WIDTH / 2, currentY + 12, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(16);
  doc.text('This is to certify that', A4_WIDTH / 2, currentY + 25, { align: 'center' });

  // PRINT FORMATTED NAME
  doc.setFont('times', 'italic');
  doc.setFontSize(38);
  doc.setTextColor(GOLD);
  doc.text(formattedName, A4_WIDTH / 2, currentY + 42, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(DARK_GREY);
  doc.text(
    `Has successfully completed the Child Protection Policy Training with a score of ${score}%.`,
    A4_WIDTH / 2, currentY + 55, { align: 'center' }
  );

  // Footer section remains relative to bottom to ensure it stays on one page
  const footerY = 185;
  doc.setFontSize(11);
  doc.setTextColor(DARK_GREY);
  doc.text(`Date Issued: ${dateStr}`, MARGIN + 15, footerY);

  doc.setLineWidth(0.3);
  doc.line(A4_WIDTH / 2 - 35, footerY - 2, A4_WIDTH / 2 + 35, footerY - 2);
  doc.text('Church Leadership', A4_WIDTH / 2, footerY + 2, { align: 'center' });

  doc.setTextColor(FIRE_ENGINE_RED); 
  doc.text(`Valid Until: ${expiryStr}`, A4_WIDTH - MARGIN - 55, footerY);

  doc.setTextColor(DARK_GREY);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text('Renewal is required annually on or before the 1st anniversary.', A4_WIDTH / 2, A4_HEIGHT - MARGIN - 5, { align: 'center' });

  return doc.output('datauristring');
};