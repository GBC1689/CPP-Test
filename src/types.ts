
export interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  falseIndex: number; 
  explanation: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  gradeTaught: string;
  intendToTeach: boolean;
  lastSuccessfulTestDate?: string;
  testAttempts: TestResult[];
  isAdmin: boolean;
}

export interface TestResult {
  date: string;
  score: number;
  passed: boolean;
  questionDetails: QuestionAttempt[];
}

export interface QuestionAttempt {
  questionId: number;
  attempts: number;
  isCorrect: boolean;
}

export type AppState = 'AUTH' | 'DASHBOARD' | 'QUIZ' | 'RESULT' | 'PROFILE' | 'ADMIN';
