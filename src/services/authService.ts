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

  // 2. Register a new user
  async register(email: string, password: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser: User = {
      id: userCredential.user.uid,
      email,
      firstName: '', // Initialize empty for the Gatekeeper to catch
      lastName: '',  // Initialize empty for the Gatekeeper to catch
      isAdmin: false,
      completedTests: 0,
      bestScore: 0,
      results: []
    };
    
    await setDoc(doc(db, 'users', newUser.id), newUser);
    return newUser;
  },

  // 3. Login with password
  async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userProfile = await this.getUserProfile(userCredential.user.uid);
    
    if (!userProfile) {
      throw new Error("User record not found in database.");
    }
    
    return userProfile;
  },

  // 4. THE MISSING PIECE: Update User Profile (Names, etc.)
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
    const userRef = doc(db, 'users', userId);
    
    // Calculate new best score and increment total tests
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
  },

  // 6. Logout
  async logout() {
    return signOut(auth);
  }
};