
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
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#2E5D4E] text-white">
                <span className="text-xl font-bold">GB</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#2E5D4E] leading-tight">Germiston Baptist Church</h1>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Germiston Baptist Church - Child Protection</p>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center gap-6">
              <nav className="hidden md:flex items-center gap-2 mr-4">
                <button 
                  onClick={() => onNavigate?.('DASHBOARD')}
                  title="Home"
                  className={`w-20 h-20 flex flex-col items-center justify-center rounded-full transition-colors ${currentState === 'DASHBOARD' ? 'bg-[#2E5D4E] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  <span className="text-xs font-bold">Home</span>
                  <img src="/home-icon.svg" alt="Home" className="w-8 h-8" />
                </button>
                <button 
                  onClick={() => onNavigate?.('PROFILE')}
                  title="My Profile"
                  className={`w-20 h-20 flex flex-col items-center justify-center rounded-full transition-colors ${currentState === 'PROFILE' ? 'bg-[#2E5D4E] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  <span className="text-xs font-bold">Profile</span>
                  <img src="/profile-icon.svg" alt="My Profile" className="w-8 h-8" />
                </button>
                {user.isAdmin && (
                  <button 
                    onClick={() => onNavigate?.('ADMIN')}
                    title="Admin"
                    className={`w-20 h-20 flex flex-col items-center justify-center rounded-full transition-colors ${currentState === 'ADMIN' ? 'bg-[#2E5D4E] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    <span className="text-xs font-bold">Admin</span>
                    <img src="/admin-icon.svg" alt="Admin" className="w-8 h-8" />
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
