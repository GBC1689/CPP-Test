export type AppState = 'AUTH' | 'DASHBOARD' | 'QUIZ' | 'RESULT' | 'PROFILE' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  firstName?: string;  // Added for Governance
  lastName?: string;   // Added for Governance
  isAdmin: boolean;
  completedTests: number;
  lastTestDate?: string;
  bestScore: number;
  results?: TestResult[];
}

export interface TestResult {
  id: string;
  date: string;
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}
