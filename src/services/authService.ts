import { auth, db } from './firebase.ts'; 
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { User, TestResult } from '../types.ts';

export const authService = {
  // 1. Fetch user data from Firestore by UID
  async getUserProfile(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: uid, // Ensure the ID is always included
          ...data,
          results: data.results || []
        } as User;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  // 2. Updated Register: Now accepts name and grade to match Auth.tsx
  async register(name: string, email: string, password: string, grade: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Split the name for the firstName/lastName structure
      const nameParts = name.trim().split(' ');
      const fName = nameParts[0] || '';
      const lName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      const newUser: User = {
        id: userCredential.user.uid,
        email,
        firstName: fName, 
        lastName: lName,  
        gradeTaught: grade,
        isAdmin: false,
        completedTests: 0,
        bestScore: 0,
        results: [],
        intendToTeach: true
      };
      
      await setDoc(doc(db, 'users', newUser.id), newUser);
      return newUser;
    } catch (error) {
      console.error("Registration error in service:", error);
      throw error;
    }
  },

  // 3. Login with password
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userProfile = await this.getUserProfile(userCredential.user.uid);
      
      if (!userProfile) {
        throw new Error("User record not found in database.");
      }
      
      return userProfile;
    } catch (error) {
      console.error("Login error in service:", error);
      throw error;
    }
  },

  // 4. Update User Profile (Names, etc.)
  async updateUserProfile(uid: string, data: Partial<User>) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, data);
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  // 5. Update Test Results
  async addTestResult(userId: string, result: TestResult) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      const currentBest = userData?.bestScore || 0;
      
      const updateData: any = {
        results: arrayUnion(result),
        completedTests: (userData?.completedTests || 0) + 1,
        lastTestDate: result.date,
        bestScore: Math.max(currentBest, result.score)
      };

      await updateDoc(userRef, updateData);
    } catch (error) {
      console.error("Error adding test result:", error);
      throw error;
    }
  },

  // 6. Logout
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }
};