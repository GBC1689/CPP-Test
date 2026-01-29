import jsPDF from 'jspdf';

/**
 * Robust Base64 Image Loader
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
    img.onerror = () => reject(`Failed to load logo.`);
    img.src = finalUrl;
  });
};

/**
 * Helper to capitalize names
 */
const formatTitleCase = (str: string) => {
  if (!str) return '';
  return str.toLowerCase().split(' ').filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

/**
 * Helper to get Initial and Surname (e.g., "John Doe" -> "J. Doe")
 */
const getInitialAndSurname = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return formatTitleCase(parts[0]);
  const initial = parts[0].charAt(0).toUpperCase();
  const surname = formatTitleCase(parts[parts.length - 1]);
  return `${initial}. ${surname}`;
};

export const generateCertificate = async (userName: string, score: number, lastPassDate: string | Date) => {
  const formattedName = formatTitleCase(userName);
  const signatureName = getInitialAndSurname(userName);

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

  // --- LOGO ---
  const targetWidth = 150; 
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
    currentY += targetHeight + 12; 
  } catch (e) {
    currentY += 45;
  }

  // --- MAIN CONTENT ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(PRIMARY_GREEN);
  doc.text('CHILD PROTECTION POLICY', A4_WIDTH / 2, currentY, { align: 'center' });

  doc.setFontSize(22);
  doc.setTextColor(DARK_GREY);
  doc.text('Certificate of Achievement', A4_WIDTH / 2, currentY + 12, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(16);
  doc.text('This is to certify that', A4_WIDTH / 2, currentY + 25, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(38);
  doc.setTextColor(GOLD);
  doc.text(formattedName, A4_WIDTH / 2, currentY + 42, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(15);
  doc.setTextColor(DARK_GREY);
  doc.text(
    `Has successfully completed the Child Protection Policy Training with a score of ${score}%.`,
    A4_WIDTH / 2, currentY + 56, { align: 'center' }
  );

  // --- FOOTER: SIGNATURES & DATES ---
  const signatureY = 178;
  doc.setFontSize(13); 
  doc.setTextColor(DARK_GREY);
  
  // Date Issued (Left)
  doc.setFont('helvetica', 'bold');
  doc.text('Date Issued:', MARGIN + 10, signatureY - 6);
  doc.setFont('helvetica', 'normal');
  doc.text(dateStr, MARGIN + 10, signatureY);

  // Recipient Signature (Middle-Left)
  doc.setLineWidth(0.3);
  doc.line(85, signatureY - 2, 135, signatureY - 2); 
  doc.setFontSize(10);
  doc.text(`Recipient: ${signatureName}`, 110, signatureY + 3, { align: 'center' });
  doc.setFontSize(8);
  doc.text('(Signature)', 110, signatureY + 7, { align: 'center' });

  // CPO / SSI / Elder (Middle-Right)
  doc.line(160, signatureY - 2, 210, signatureY - 2); 
  doc.setFontSize(10);
  doc.text('CPO / SSI / Elder', 185, signatureY + 3, { align: 'center' });
  doc.setFontSize(8);
  doc.text('(Signature)', 185, signatureY + 7, { align: 'center' });

  // Valid Until (Right)
  doc.setFontSize(13);
  doc.setTextColor(FIRE_ENGINE_RED); 
  doc.setFont('helvetica', 'bold');
  doc.text('Valid Until:', A4_WIDTH - MARGIN - 50, signatureY - 6);
  doc.text(expiryStr, A4_WIDTH - MARGIN - 50, signatureY);

  // --- RENEWAL NOTICE ---
  doc.setTextColor(DARK_GREY);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11); 
  doc.text('Renewal is required annually on or before the 1st anniversary.', A4_WIDTH / 2, A4_HEIGHT - MARGIN - 4, { align: 'center' });

  return doc.output('datauristring');
};