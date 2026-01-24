import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth'; 
import { auth } from './services/firebase.ts';     
import { Auth } from './components/Auth.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { Quiz } from './components/Quiz.tsx';
import { Profile } from './components/Profile.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { Layout } from './components/Layout.tsx';
import { authService } from './services/authService.ts';
import { emailService } from './services/emailService.ts';
import { User, AppState, TestResult } from './types.ts';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('AUTH');
  const [user, setUser] = useState<User | null>(null);
  const [currentResult, setCurrentResult] = useState<TestResult | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- SESSION RESTORATION ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await authService.getUserProfile(firebaseUser.uid);
          if (userData) {
            setUser(userData);
            setAppState('DASHBOARD');
          } else {
            setUser(null);
            setAppState('AUTH');
          }
        } catch (error) {
          console.error("Session restoration error:", error);
          setUser(null);
          setAppState('AUTH');
        }
      } else {
        setUser(null);
        setAppState('AUTH');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    if (!user) return;
    try {
      const updatedData = await authService.getUserProfile(user.id);
      if (updatedData) {
        setUser(updatedData);
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    // Safety check: Ensure we actually have a user object
    if (authenticatedUser && authenticatedUser.id) {
      setUser(authenticatedUser);
      setAppState('DASHBOARD');
    } else {
      setAppState('AUTH');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setAppState('AUTH');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleQuizComplete = async (result: TestResult) => {
    setCurrentResult(result);
    setAppState('RESULT');
    
    if (user) {
      try {
        await authService.addTestResult(user.id, result); 
        await refreshUser();

        setSendingEmail(true);
        await emailService.sendTestResult(user, result);
      } catch (error) {
        console.error("Post-quiz processing failed:", error);
      } finally {
        setSendingEmail(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#2E5D4E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderContent = () => {
    // --- AUTHENTICATION GATE ---
    // If we aren't loading and don't have a user, always show Auth unless in AUTH state
    if (appState !== 'AUTH' && !user) {
      return <Auth onAuthSuccess={handleAuthSuccess} />;
    }

    switch (appState) {
      case 'AUTH':
        return <Auth onAuthSuccess={handleAuthSuccess} />;

      case 'DASHBOARD':
        if (!user) return null;
        
        // --- PROFILE GATEKEEPER ---
        // Only trigger if we definitely have a logged-in user record
        if (!user.firstName || !user.lastName) {
          return <Profile user={user} onUpdate={refreshUser} />;
        }
        return <Dashboard user={user} onStartQuiz={() => setAppState('QUIZ')} />;

      case 'QUIZ':
        return <Quiz onComplete={handleQuizComplete} onCancel={() => setAppState('DASHBOARD')} />;

      case 'PROFILE':
        return user ? <Profile user={user} onUpdate={refreshUser} /> : null;

      case 'ADMIN':
        return user?.isAdmin ? <AdminDashboard /> : <div className="p-12 text-center text-red-500 font-bold">Unauthorized Access</div>;

      case 'RESULT':
        return (
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center space-y-6 max-w-2xl mx-auto">
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
                  ? "Well done! Your results have been recorded."
                  : "You didn't reach the required 80%. Please try again."
                }
              </p>
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-400">
                {sendingEmail ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#2E5D4E] border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Results...</span>
                  </>
                ) : (
                  <span>Results logged successfully.</span>
                )}
              </div>
            </div>
            <div className="pt-6">
              <button onClick={() => setAppState('DASHBOARD')} className="px-8 py-3 bg-[#2E5D4E] text-white rounded-xl font-bold hover:scale-105 transition-transform">
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
    <Layout user={user || undefined} onLogout={handleLogout} onNavigate={setAppState} currentState={appState}>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;