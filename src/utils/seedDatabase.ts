// src/utils/seedDatabase.ts
import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '../services/firebase';
import { QUESTION_POOL } from '../constants';
import { Question } from '../types';

/**
 * A one-time utility function to upload the hard-coded question pool to Firestore.
 * This should be run once by a developer with Firestore access to populate the database.
 *
 * To run this, you could temporarily expose it on a button in the UI or run it
 * in a controlled environment.
 *
 * @returns {Promise<void>}
 */
export const uploadQuestionsToFirestore = async (): Promise<void> => {
  // 1. Get a reference to the target collection
  const questionsCollection = collection(db, 'questions');

  // 2. Create a "batch" to perform multiple writes in a single atomic operation.
  // This is more efficient than writing documents one by one.
  const batch = writeBatch(db);

  console.log('Starting batch upload of questions to Firestore...');

  // 3. Loop through the local QUESTION_POOL array
  QUESTION_POOL.forEach((question: Question) => {
    // For each question, create a new document reference in the 'questions' collection.
    // We use the question's numeric ID and convert it to a string for the document ID.
    const docRef = doc(questionsCollection, question.id.toString());

    // Add a 'set' operation to the batch. This will create the document with the question data.
    batch.set(docRef, question);
  });

  try {
    // 4. Commit the batch. All writes are sent to Firestore at once.
    await batch.commit();
    console.log('✅ Success! Question pool has been uploaded to Firestore.');
    alert('Successfully seeded the database with 50 questions.');
  } catch (error) {
    console.error("🔥 Error seeding database:", error);
    alert('An error occurred while seeding the database. Check the console.');
  }
};
