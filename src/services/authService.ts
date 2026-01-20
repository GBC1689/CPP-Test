import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { User, TestResult } from '../types';

export const authService = {
  // This registers a new worker in the Firebase Database
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
    
    // Save the user "Form" into the Firestore Drawer
    await setDoc(doc(db, 'users', newUser.id), newUser);
    return newUser;
  },

  // This logs a worker in
  async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    return userDoc.data() as User;
  },

  // This saves the Test Result to the Cloud
  async addTestResult(userId: string, result: TestResult) {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data() as User;
      const updatedAttempts = [...userData.testAttempts, result];
      await updateDoc(userRef, {
        testAttempts: updatedAttempts,
        lastSuccessfulTestDate: result.passed ? result.date : userData.lastSuccessfulTestDate
      });
    }
  },

  logout() {
    return signOut(auth);
  }
};