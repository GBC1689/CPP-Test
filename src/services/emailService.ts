
import { collection, addDoc, writeBatch, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { User, TestResult } from '../types';

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
      this.logErrorToAdmin('Test Result Email', error);
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
      this.logErrorToAdmin('Account Deletion Email', error);
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
      this.logErrorToAdmin('Bulk Reminder Email', error);
      return false;
    }
  },

  /**
   * Logs an email sending error to the admin.
   */
  logErrorToAdmin: async (context: string, error: any): Promise<void> => {
    try {
      // Fetch the admin email from config
      const configDoc = await getDoc(doc(db, 'config', 'admin'));
      const adminEmail = configDoc.exists() ? configDoc.data().notificationEmail : null;

      if (!adminEmail) {
        console.error("CRITICAL: Admin notification email is not set. Cannot log error.");
        return;
      }

      await addDoc(mailCollection, {
        to: adminEmail,
        message: {
          subject: `GBC Portal Alert: Email Sending Failed`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; background-color: #fbeaea; border: 1px solid #f5c6cb; border-radius: 10px;">
              <h2 style="color: #721c24;">Email System Error</h2>
              <p>An error occurred while trying to send an email.</p>
              <p><strong>Context:</strong> ${context}</p>
              <p><strong>Error Details:</strong></p>
              <pre style="background-color: #f8d7da; padding: 10px; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word;">${JSON.stringify(error, null, 2)}</pre>
              <p>This is an automated alert. Please check the Firestore 'mail' collection and system logs.</p>
            </div>
          `,
        },
      });
    } catch (logError) {
      console.error("CRITICAL: Failed to even log the email error to the admin.", logError);
    }
  }
};
