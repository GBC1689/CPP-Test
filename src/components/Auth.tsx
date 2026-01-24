import React, { useState } from 'react';
import { authService } from '../services/authService.ts';
import { User } from '../types.ts';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

const GRADES = ["Nursery", "Pre-School", "Grade R", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Youth", "Administration"];

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [grade, setGrade] = useState(GRADES[0]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- THE SECURE HANDSHAKE ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        if (!firstName || !lastName || !email || !password || !grade) {
          throw new Error('Please fill in all fields');
        }
        
        // Wait for registration to complete
        const newUser = await authService.register(firstName, lastName, email, password, grade);
        onAuthSuccess(newUser);
        
      } else {
        if (!email || !password) {
          throw new Error('Please enter email and password');
        }
        
        // Wait for login to complete
        const user = await authService.login(email, password);
        
        // Logic Guard: Only proceed if a user object was actually returned
        if (user) {
          onAuthSuccess(user);
        } else {
          throw new Error('Account not found.');
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/invalid-credential' || err.message.includes('INVALID_LOGIN_CREDENTIALS')) {
        setError("Login failed. Please register if you are using this app for the first time.");
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#2E5D4E] mb-2">
          {isRegistering ? 'New Staff Registration' : 'Staff Login'}
        </h2>
        <p className="text-gray-500">Secure access for GBC staff and volunteers</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegistering && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5D4E] outline-none"
                placeholder="e.g. John"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5D4E] outline-none"
                placeholder="e.g. Doe"
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5D4E] outline-none"
            placeholder="yourname@church.com"
            disabled={isLoading}
          />
        </div>

        <div className="relative">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Password</label>
          <input 
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5D4E] outline-none"
            placeholder="••••••••"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600"
          >
            <img
              src={showPassword ? "/open.ico" : "/closed.ico"}
              alt={showPassword ? "Hide password" : "Show password"}
              className="w-5 h-5"
            />
          </button>
        </div>

        {isRegistering && (
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Grade Taught</label>
            <select 
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5D4E] outline-none bg-white"
              disabled={isLoading}
            >
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-xl text-center font-medium border border-red-100">
            {error}
          </div>
        )}

        <button 
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 bg-[#2E5D4E] text-white font-bold rounded-xl transition-all shadow-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#254a3e]'}`}
        >
          {isLoading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In')}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <button 
          onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
          className="text-[#2E5D4E] font-medium hover:underline"
          disabled={isLoading}
        >
          {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register here"}
        </button>
      </div>
    </div>
  );
};