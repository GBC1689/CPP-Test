import { auth, db } from './firebase.ts'; 
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { User, TestResult } from '../types.ts';

export const authService = {
  // 1. Fetch user data from Firestore by UID (Defensive version)
  async getUserProfile(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        // Ensure testAttempts exists so the app doesn't crash reading .length
        return {
          ...data,
          testAttempts: data.testAttempts || []
        } as User;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  // 2. Register a new user
  async register(email: string, name: string, password: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser: User = {
      id: userCredential.user.uid,
      email,
      name,
      gradeTaught: '',
      intendToTeach: true,
      testAttempts: [],
      isAdmin: false
    };
    
    await setDoc(doc(db, 'users', newUser.id), newUser);
    return newUser;
  },

  // 3. Login with password (Defensive version)
  async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      throw new Error("User record not found in database.");
    }
    
    const data = userDoc.data();
    // Safely inject an empty array if the user is new/empty
    return {
      ...data,
      testAttempts: data.testAttempts || []
    } as User;
  },

  // 4. Update Test Results
  async addTestResult(userId: string, result: TestResult) {
    const userRef = doc(db, 'users', userId);
    
    const updateData: any = {
      testAttempts: arrayUnion(result)
    };

    if (result.passed) {
      updateData.lastSuccessfulTestDate = result.date;
    }

    await updateDoc(userRef, updateData);
  },

  // 5. Logout
  async logout() {
    return signOut(auth);
  }
};