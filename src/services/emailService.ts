import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { User, TestResult } from '../types';

// Consistent full name helper
const getFullName = (user: User) => `${user.firstName || ''} ${user.lastName || ''}`.trim();

export const emailService = {
  /**
   * Updates the user's document in Firestore to show a "Certificate Requested" status.
   * This will allow the Admin Dashboard to show a tick/badge.
   */
  sendCertificateRequest: async (user: User): Promise<boolean> => {
    try {
      // Reference to the specific user document in the 'users' collection
      const userRef = doc(db, 'users', user.id);
      
      // We set 'certificateRequested' to true
      await updateDoc(userRef, {
        certificateRequested: true,
        certificateRequestDate: new Date().toISOString(),
      });

      console.log(`Certificate request logged in Firestore for ${getFullName(user)}`);
      return true;
    } catch (error) {
      console.error("Error updating certificate request in Firestore:", error);
      // We return false so the UI can show an error message if the database update fails
      return false;
    }
  },

  /**
   * Helper to clear the request once the admin has processed it.
   * You can call this from your Admin Dashboard when clicking 'Download'.
   */
  clearCertificateRequest: async (userId: string): Promise<boolean> => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        certificateRequested: false
      });
      return true;
    } catch (error) {
      console.error("Error clearing certificate request:", error);
      return false;
    }
  },

  // Placeholders to keep the app from breaking if these are called elsewhere
  sendTestResult: async () => true,
  sendAccountDeletedEmail: async () => true,
  sendBulkReminderEmail: async () => true,
  sendInvalidLoginAttemptEmail: async () => true,
  sendCertificateEmail: async () => true
};