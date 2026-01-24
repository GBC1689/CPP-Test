import React from 'react';
import { User, AppState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user?: User;
  onLogout?: () => void;
  onNavigate?: (state: AppState) => void;
  currentState: AppState;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onNavigate, currentState }) => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-[#32CD32]">
      <header className="w-full bg-white shadow-sm border-b border-gray-100 mb-8 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => onNavigate?.('DASHBOARD')}
          >
            {/* FIXED: Removed leading slash from src so it works on GitHub Pages subfolder */}
            <img src="favicon.ico" alt="GBC Logo" className="w-12 h-12" />
            <div>
              <h1 className="text-xl font-bold text-[#2E5D4E] leading-tight">Germiston Baptist Church</h1>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Child Protection Test</p>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center gap-6">
              <nav className="hidden md:flex items-center gap-2 mr-4">
                <button
                  onClick={() => onNavigate?.('DASHBOARD')}
                  title="Home"
                  className={`flex flex-col items-center justify-center rounded-lg transition-colors p-2 ${currentState === 'DASHBOARD' ? 'text-[#2E5D4E]' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
                  <span className="text-xs font-bold">Home</span>
                </button>
                <button
                  onClick={() => onNavigate?.('PROFILE')}
                  title="My Profile"
                  className={`flex flex-col items-center justify-center rounded-lg transition-colors p-2 ${currentState === 'PROFILE' ? 'text-[#2E5D4E]' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                  <span className="text-xs font-bold">Profile</span>
                </button>
                {user.isAdmin && (
                  <button
                    onClick={() => onNavigate?.('ADMIN')}
                    title="Admin"
                    className={`flex flex-col items-center justify-center rounded-lg transition-colors p-2 ${currentState === 'ADMIN' ? 'text-[#2E5D4E]' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"></path><path d="M10.5 9.5a.5.5 0 01-.5.5h-3a.5.5 0 010-1h3a.5.5 0 01.5.5zm0 2a.5.5 0 01-.5.5h-3a.5.5 0 010-1h3a.5.5 0 01.5.5z"></path></svg>
                    <span className="text-xs font-bold">Admin</span>
                  </button>
                )}
              </nav>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-800">{`${user.firstName} ${user.lastName}`}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">{user.gradeTaught}</p>
                </div>
                <button 
                  onClick={onLogout}
                  className="text-sm px-4 py-2 border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="w-full max-w-4xl px-6 pb-12 animate-fade-in">
        {children}
      </main>

      <footer className="w-full border-t border-gray-200 bg-white py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Germiston Baptist Church. Internal Policy Test Portal.</p>
          <div className="flex gap-4">
             <span className="hover:text-gray-600 cursor-help">Help Center</span>
             <span className="hover:text-gray-600 cursor-help">Privacy Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
};