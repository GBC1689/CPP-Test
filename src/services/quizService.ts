// src/services/quizService.ts
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from './firebase';
import { Question } from '../types';

/**
 * Fetches the entire pool of questions from the 'questions' collection in Firestore.
 *
 * @returns {Promise<Question[]>} A promise that resolves to an array of questions.
 */
export const getQuestionsFromFirestore = async (): Promise<Question[]> => {
  const questionsCollection = collection(db, 'questions');
  const q = query(questionsCollection);

  try {
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn("No questions found in the 'questions' collection.");
      return [];
    }

    // Map the documents to the Question type
    const questions = querySnapshot.docs.map(doc => doc.data() as Question);

    // It's good practice to sort by ID to ensure consistent order
    return questions.sort((a, b) => a.id - b.id);

  } catch (error) {
    console.error("🔥 Error fetching questions from Firestore:", error);
    // In a real app, you might want to throw the error or handle it more gracefully
    // For now, we return an empty array to prevent the quiz from crashing.
    return [];
  }
};
