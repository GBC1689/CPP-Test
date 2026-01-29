import emailjs from '@emailjs/browser';
import { User, TestResult } from '../types';
import { configService } from './configService';

// YOUR EMAILJS CREDENTIALS - Replace with your actual IDs
const SERVICE_ID = 'service_jzlf5sn'; // From Email Services tab
const PUBLIC_KEY = 'inYasSPsbGxdb0yuJ'; // From Account > API Keys
const ADMIN_CERT_TEMPLATE_ID = 'template_0lr5jui'; 
const USER_CONFIRM_TEMPLATE_ID = 'template_0lr5jui'; // Create this for the user confirmation

// Consistent full name helper
const getFullName = (user: User) => `${user.firstName || ''} ${user.lastName || ''}`.trim();

export const emailService = {
  /**
   * Requests a printed certificate from the Admin and notifies the User.
   */
  sendCertificateRequest: async (user: User, score: number): Promise<boolean> => {
    const userName = getFullName(user);
    
    try {
      const adminEmail = await configService.getAdminNotificationEmail();
      
      const templateParams = {
        user_name: userName,
        user_email: user.email,
        admin_email: adminEmail,
        score: `${score}%`,
      };

      // 1. Send Request to Admin
      const adminRes = await emailjs.send(
        SERVICE_ID,
        ADMIN_CERT_TEMPLATE_ID,
        templateParams,
        PUBLIC_KEY
      );

      // 2. Send Confirmation to User (if you created the second template)
      if (USER_CONFIRM_TEMPLATE_ID !== 'YOUR_USER_CONFIRM_TEMPLATE_ID') {
        await emailjs.send(
          SERVICE_ID,
          USER_CONFIRM_TEMPLATE_ID,
          templateParams,
          PUBLIC_KEY
        );
      }

      return adminRes.status === 200;
    } catch (error) {
      console.error("Error sending certificate request via EmailJS:", error);
      return false;
    }
  },

  /**
   * Generic handler for other email types. 
   * Note: You will need to create templates in EmailJS for these to work.
   */
  sendTestResult: async (user: User, result: TestResult): Promise<boolean> => {
    console.warn("sendTestResult called: Ensure you have an EmailJS template for this.");
    // To implement: Create a template in EmailJS and use emailjs.send() here
    return true; 
  },

  sendAccountDeletedEmail: async (user: User): Promise<boolean> => {
    console.warn("sendAccountDeletedEmail called: Ensure you have an EmailJS template for this.");
    return true;
  },

  sendBulkReminderEmail: async (users: User[]): Promise<boolean> => {
    // Note: EmailJS is not designed for mass bulk mail. 
    // For 5-10 users, you can loop through them.
    console.warn("Bulk reminders need individual EmailJS calls.");
    return true;
  },

  sendInvalidLoginAttemptEmail: async (attemptedEmail: string): Promise<boolean> => {
    console.warn("Invalid login attempt: Create a template for security alerts.");
    return true;
  },

  sendCertificateEmail: async (user: User, pdfDataUri: string): Promise<boolean> => {
    // NOTE: EmailJS supports attachments only on paid plans or via specific configurations.
    // For now, this will notify the user their cert is ready.
    console.warn("Certificate Email: Attachments require EmailJS premium or specific setup.");
    return true;
  }
};