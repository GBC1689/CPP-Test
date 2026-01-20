
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Quiz } from './components/Quiz';
import { Profile } from './components/Profile';
import { AdminDashboard } from './components/AdminDashboard';
import { authService } from './services/authService';
import { emailService } from './services/emailService';
import { User, AppState, TestResult } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('AUTH');
  const [user, setUser] = useState<User | null>(null);
  const [currentResult, setCurrentResult] = useState<TestResult | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Load existing session
  useEffect(() => {
    const activeUser = authService.getCurrentUser();
    if (activeUser) {
      setUser(activeUser);
      setAppState('DASHBOARD');
    }
  }, []);

  const refreshUser = () => {
    const activeUser = authService.getCurrentUser();
    if (activeUser) setUser(activeUser);
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setAppState('DASHBOARD');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setAppState('AUTH');
  };

  const handleQuizComplete = async (result: TestResult) => {
    setCurrentResult(result);
    setAppState('RESULT');
    
    if (user) {
      authService.updateUserTestHistory(user.id, result);
      refreshUser();

      setSendingEmail(true);
      await emailService.sendTestResult(authService.getCurrentUser()!, result);
      setSendingEmail(false);
    }
  };

  const renderContent = () => {
    switch (appState) {
      case 'AUTH':
        return <Auth onAuthSuccess={handleAuthSuccess} />;
      case 'DASHBOARD':
        return user ? <Dashboard user={user} onStartQuiz={() => setAppState('QUIZ')} /> : null;
      case 'QUIZ':
        return <Quiz 
          onComplete={handleQuizComplete} 
          onCancel={() => setAppState('DASHBOARD')} 
        />;
      case 'PROFILE':
        return user ? <Profile user={user} onUpdate={refreshUser} /> : null;
      case 'ADMIN':
        return user?.isAdmin ? <AdminDashboard /> : <div className="p-12 text-center text-red-500 font-bold">Unauthorized Access</div>;
      case 'RESULT':
        return (
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center space-y-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${currentResult?.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {currentResult?.passed 
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                }
              </svg>
            </div>
            
            <h2 className={`text-4xl font-bold ${currentResult?.passed ? 'text-green-700' : 'text-red-700'}`}>
              {currentResult?.passed ? 'Certification Passed!' : 'Retry Recommended'}
            </h2>
            
            <div className="py-4">
              <span className="text-gray-500 text-sm uppercase font-bold tracking-widest block mb-1">Final Score</span>
              <span className="text-6xl font-black text-gray-800">{currentResult?.score}%</span>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl space-y-3">
              <p className="text-gray-600 leading-relaxed">
                {currentResult?.passed 
                  ? "Well done! You have demonstrated a strong understanding of our Child Protection Policy. Your results have been recorded and sent to the church administration."
                  : "You didn't reach the required 80% passing grade. We encourage you to review the Child Protection Policy document again and retake the test when ready."
                }
              </p>
              
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-400">
                {sendingEmail ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#2E5D4E] border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Results & Emailing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>
                    <span>Results logged and sent to church office.</span>
                  </>
                )}
              </div>
            </div>

            <div className="pt-6">
              <button 
                onClick={() => setAppState('DASHBOARD')}
                className="px-8 py-3 bg-[#2E5D4E] text-white rounded-xl font-bold hover:bg-[#254a3e] transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout 
      user={user || undefined} 
      onLogout={handleLogout} 
      onNavigate={setAppState} 
      currentState={appState}
    >
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
