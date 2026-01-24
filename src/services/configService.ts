import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const CONFIG_COLLECTION = 'config';
const ADMIN_DOC = 'admin';

export const configService = {
  /**
   * Fetches the admin notification email from Firestore.
   * Defaults to a hardcoded value if not found.
   */
  async getAdminNotificationEmail(): Promise<string> {
    try {
      const docRef = doc(db, CONFIG_COLLECTION, ADMIN_DOC);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().notificationEmail) {
        return docSnap.data().notificationEmail;
      }
      // Return a default value if not set in Firestore
      return 'lexicon.sm@gmail.com';
    } catch (error) {
      console.error("Error fetching admin notification email:", error);
      // Fallback to default on error
      return 'lexicon.sm@gmail.com';
    }
  },

  /**
   * Sets or updates the admin notification email in Firestore.
   */
  async setAdminNotificationEmail(email: string): Promise<boolean> {
    try {
      const docRef = doc(db, CONFIG_COLLECTION, ADMIN_DOC);
      await setDoc(docRef, { notificationEmail: email }, { merge: true });
      return true;
    } catch (error) {
      console.error("Error setting admin notification email:", error);
      return false;
    }
  }
};
