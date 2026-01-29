import React, { useState, useEffect } from 'react';
import { generateCertificate } from '../utils/certificateGenerator';
import { Question, QuestionAttempt, TestResult } from '../types';
import { getQuestionsFromFirestore } from '../services/quizService';

interface QuizProps {
  onComplete: (result: TestResult) => void;
  onCancel: () => void;
  userName?: string; // Added to facilitate certificate generation
}

export const Quiz: React.FC<QuizProps> = ({ onComplete, onCancel, userName = "Staff Member" }) => {
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [attemptsHistory, setAttemptsHistory] = useState<QuestionAttempt[]>([]);
  const [testFinished, setTestFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Initialize questions from Firestore
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const allQuestions = await getQuestionsFromFirestore();
        if (allQuestions.length > 0) {
          const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
          setShuffledQuestions(shuffled.slice(0, 20));
        }
      } catch (error) {
        console.error("Failed to load questions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const currentQuestion = shuffledQuestions[currentIndex];

  const handleOptionClick = (optionIndex: number) => {
    if (showExplanation || testFinished) return;
    setSelectedOption(optionIndex);

    const isCorrect = optionIndex === currentQuestion.correctIndex;
    
    if (isCorrect) {
      const attempt: QuestionAttempt = {
        questionId: currentQuestion.id,
        attempts: currentAttempts + 1,
        isCorrect: true
      };
      setAttemptsHistory(prev => [...prev, attempt]);
      
      setTimeout(() => {
        handleNextQuestion();
      }, 1000);
    } else {
      if (currentAttempts === 0) {
        setCurrentAttempts(1);
        setTimeout(() => setSelectedOption(null), 1000);
      } else {
        const attempt: QuestionAttempt = {
          questionId: currentQuestion.id,
          attempts: 2,
          isCorrect: false
        };
        setAttemptsHistory(prev => [...prev, attempt]);
        setShowExplanation(true);
      }
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    setCurrentAttempts(0);

    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setTestFinished(true);
    const score = attemptsHistory.filter(a => a.isCorrect).length * 5;
    const result: TestResult = {
      date: new Date().toISOString(),
      score,
      passed: score >= 80,
      questionDetails: attemptsHistory
    };
    onComplete(result);
  };

  const handleDownloadCertificate = async () => {
    const score = attemptsHistory.filter(a => a.isCorrect).length * 5;
    setIsGeneratingPdf(true);
    try {
      // FIX: Added the 3rd argument (new Date()) to match the updated generator
      const dataUri = await generateCertificate(userName, score, new Date());
      
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = `GBC_Certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("PDF Download error:", error);
      alert("Could not generate certificate. Please contact admin.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (isLoading || shuffledQuestions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-gray-600">Loading Quiz...</h2>
      </div>
    );
  }

  // Result View
  if (testFinished) {
    const score = attemptsHistory.filter(a => a.isCorrect).length * 5;
    const passed = score >= 80;

    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center animate-fade-in">
        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {passed 
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            }
          </svg>
        </div>
        <h2 className="text-3xl font-black mb-2">{passed ? 'Congratulations!' : 'Keep Practicing'}</h2>
        <p className="text-gray-500 mb-8">You scored {score}% in the Child Protection Policy Training.</p>
        
        <div className="flex flex-col gap-4">
          {passed && (
            <button 
              onClick={handleDownloadCertificate}
              disabled={isGeneratingPdf}
              className="w-full bg-[#2E5D4E] text-white py-4 rounded-xl font-bold hover:bg-[#254a3e] transition-all flex items-center justify-center gap-2"
            >
              {isGeneratingPdf ? 'Generating...' : 'Download Certificate'}
            </button>
          )}
          <button 
            onClick={onCancel}
            className="w-full bg-gray-100 text-gray-600 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex) / shuffledQuestions.length) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
        <div className="h-full bg-[#2E5D4E] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex justify-between items-center mb-8">
        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Question {currentIndex + 1} of 20</span>
        <button onClick={onCancel} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Exit Quiz</button>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">{currentQuestion.text}</h2>

      <div className="grid grid-cols-1 gap-4">
        {currentQuestion.options.map((option, idx) => {
          let stateClass = "border-gray-200 hover:border-[#2E5D4E] hover:bg-green-50";
          if (selectedOption === idx) {
            stateClass = idx === currentQuestion.correctIndex ? "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-500" : "border-red-500 bg-red-50 text-red-700 ring-2 ring-red-500";
          }
          return (
            <button key={idx} onClick={() => handleOptionClick(idx)} disabled={showExplanation} className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center gap-4 ${stateClass} disabled:opacity-50`}>
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm ${selectedOption === idx ? 'border-transparent bg-white shadow-sm' : 'border-gray-300'}`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="font-medium text-lg">{option}</span>
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className="mt-8 p-6 bg-[#2E5D4E] bg-opacity-5 rounded-2xl border-2 border-[#2E5D4E] animate-slide-up">
          <div className="flex items-start gap-4">
             <div className="bg-[#2E5D4E] text-white p-2 rounded-lg mt-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             </div>
             <div>
               <h4 className="font-bold text-[#2E5D4E] text-lg mb-1">Let's learn why:</h4>
               <p className="text-gray-700 leading-relaxed mb-4">{currentQuestion.explanation}</p>
               <button onClick={handleNextQuestion} className="bg-[#2E5D4E] text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 transition-all">Continue</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};