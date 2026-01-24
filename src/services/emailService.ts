
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';
import { User, TestResult } from '../types';
import { configService } from './configService';

// Get a reference to the collection the 'Trigger Email' extension listens to
const mailCollection = collection(db, 'mail');

// Consistent full name helper
const getFullName = (user: User) => `${user.firstName || ''} ${user.lastName || ''}`.trim();

export const emailService = {
  /**
   * Triggers an email by adding a document to the 'mail' collection.
   */
  sendTestResult: async (user: User, result: TestResult): Promise<boolean> => {
    const userName = getFullName(user);
    const subject = `GBC Child Protection Test: ${result.passed ? 'PASSED' : 'FAILED'} - ${userName}`;
    
    const emailHtml = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
        <h2 style="color: #2E5D4E;">GBC - Child Protection Test Result</h2>
        <p><strong>Staff Member:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Date:</strong> ${new Date(result.date).toLocaleString()}</p>
        <p><strong>Score:</strong> <strong style="font-size: 1.2em; color: ${result.passed ? 'green' : 'red'};">${result.score}%</strong></p>
        <p><strong>Status:</strong> ${result.passed ? 'PASSED (80% required)' : 'RETRY REQUIRED'}</p>
        <hr>
        <p>This is an automated notification. Please do not reply.</p>
      </div>
    `;

    try {
      await addDoc(mailCollection, {
        to: user.email,
        message: {
          subject: subject,
          html: emailHtml,
        },
      });
      console.log(`Email trigger for ${userName}'s test result created.`);
      return true;
    } catch (error) {
      console.error("Error triggering test result email:", error);
      return false;
    }
  },

  /**
   * Triggers a notification email when an admin deletes a user account.
   */
  sendAccountDeletedEmail: async (user: User): Promise<boolean> => {
    const userName = getFullName(user);
    const subject = `GBC Portal: Account Access Revoked - ${userName}`;
    
    const emailHtml = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
        <h2 style="color: #2E5D4E;">GBC Portal - Account Deletion Notice</h2>
        <p>Dear ${userName},</p>
        <p>This is a formal notification that your access to the GBC Child Protection Portal has been removed by the administration.</p>
        <p>If you believe this is an error or if you intend to continue teaching, please contact the Sunday School Superintendent or Church Elders immediately.</p>
        <br>
        <p>Regards,<br>GBC Administration</p>
      </div>
    `;

    try {
      await addDoc(mailCollection, {
        to: user.email,
        message: {
          subject: subject,
          html: emailHtml,
        },
      });
      console.log(`Account deletion email trigger for ${userName} created.`);
      return true;
    } catch (error) {
      console.error("Error triggering account deletion email:", error);
      return false;
    }
  },

  /**
   * Creates multiple email documents in a batch for bulk reminders.
   */
  sendBulkReminderEmail: async (users: User[]): Promise<boolean> => {
    const batch = writeBatch(db);

    users.forEach(user => {
      const userName = getFullName(user);
      const docRef = doc(mailCollection); // Create a new doc reference for each email

      batch.set(docRef, {
        to: user.email,
        message: {
          subject: `Action Required: GBC Child Protection Certification Expired`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
              <h2 style="color: #2E5D4E;">GBC Portal - Certification Expired</h2>
              <p>Dear ${userName},</p>
              <p>This is a reminder that your Child Protection Policy certification has expired. To continue serving in the children's ministry, you must retake and pass the test.</p>
              <p>Please log in to the portal to complete your recertification at your earliest convenience.</p>
              <br>
              <p>Regards,<br>GBC Administration</p>
            </div>
          `,
        },
      });
    });

    try {
      await batch.commit();
      console.log(`Batch created for ${users.length} reminder emails.`);
      return true;
    } catch (error) {
      console.error("Error creating bulk reminder email batch:", error);
      return false;
    }
  },

  /**
   * Notifies the admin of an invalid login attempt.
   */
  sendInvalidLoginAttemptEmail: async (attemptedEmail: string): Promise<boolean> => {
    try {
      const adminEmail = await configService.getAdminNotificationEmail();

      const emailHtml = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
          <h2 style="color: #D32F2F;">GBC Portal - Invalid Login Alert</h2>
          <p>An attempt was made to log in with an email address that is not registered in the system.</p>
          <p><strong>Attempted Email:</strong> ${attemptedEmail}</p>
          <hr>
          <p>This is an automated security notification.</p>
        </div>
      `;

      await addDoc(mailCollection, {
        to: adminEmail,
        message: {
          subject: 'GBC Portal Security: Invalid Login Attempt',
          html: emailHtml,
        },
      });

      console.log(`Admin notification sent for invalid login attempt by ${attemptedEmail}.`);
      return true;
    } catch (error) {
      console.error("Error triggering invalid login attempt email:", error);
      return false;
    }
  },

  /**
   * Triggers an email with a PDF certificate attached.
   */
  sendCertificateEmail: async (user: User, pdfDataUri: string): Promise<boolean> => {
    const userName = getFullName(user);
    const subject = `GBC Child Protection Certificate - ${userName}`;

    const emailHtml = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
        <h2 style="color: #2E5D4E;">GBC - Child Protection Certificate</h2>
        <p>Dear ${userName},</p>
        <p>Please find your certificate of completion attached to this email.</p>
        <p>This certificate is valid for one year. Please ensure you retake the test before it expires to remain in active ministry.</p>
        <br>
        <p>Regards,<br>GBC Administration</p>
      </div>
    `;

    try {
      await addDoc(mailCollection, {
        to: user.email,
        message: {
          subject: subject,
          html: emailHtml,
          attachments: [
            {
              filename: `${userName.replace(/\s+/g, '_')}_GBC_Certificate.pdf`,
              content: pdfDataUri.split('base64,')[1],
              encoding: 'base64',
            },
          ],
        },
      });
      console.log(`Certificate email trigger for ${userName} created.`);
      return true;
    } catch (error) {
      console.error("Error triggering certificate email:", error);
      return false;
    }
  }
};
