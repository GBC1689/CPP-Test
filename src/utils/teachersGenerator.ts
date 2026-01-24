
import jsPDF from 'jspdf';
import { User } from '../types';

export const generateTeachersPdf = async (users: User[]): Promise<string> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // --- STYLING CONSTANTS ---
  const PRIMARY_GREEN = '#2E5D4E';
  const DARK_GREY = '#333333';
  const A4_WIDTH = 210;
  const MARGIN = 15;
  let yPos = 25;

  // --- LOGO ---
  try {
    const response = await fetch('/logo.png');
    const blob = await response.blob();
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    await new Promise(resolve => reader.onload = resolve);
    const logoData = reader.result as string;
    doc.addImage(logoData, 'PNG', MARGIN, 15, 30, 30);
  } catch (e) {
    console.error("Logo not found. Ensure /public/logo.png exists.");
  }

  // --- HEADER ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(PRIMARY_GREEN);
  doc.text('Teachers by Grade Report', A4_WIDTH / 2, yPos, { align: 'center' });
  yPos += 20;

  const teachersByGrade = users.reduce((acc, user) => {
    if (user.gradeTaught) {
      const grades = Array.isArray(user.gradeTaught) ? user.gradeTaught : [user.gradeTaught];
      grades.forEach(grade => {
        if (!acc[grade]) {
          acc[grade] = [];
        }
        acc[grade].push(user);
      });
    }
    return acc;
  }, {} as Record<string, User[]>);

  Object.entries(teachersByGrade).forEach(([grade, teachers]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(DARK_GREY);
    doc.text(grade, MARGIN, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    teachers.forEach(teacher => {
      doc.text(`${teacher.firstName} ${teacher.lastName} - ${teacher.email}`, MARGIN + 5, yPos);
      yPos += 7;
      if (yPos > 280) {
        doc.addPage();
        yPos = 25;
      }
    });
    yPos += 5;
  });

  return doc.output('datauristring');
};
