
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

const GRADES = ["Nursery", "Pre-School", "Grade R", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Youth", "Administration"];

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(GRADES[0]);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      if (!name || !email || !password || !grade) {
        setError('Please fill in all fields');
        return;
      }
      const newUser = authService.register(name, email, password, grade);
      if (newUser) {
        onAuthSuccess(newUser);
      } else {
        setError('User already exists');
      }
    } else {
      if (!email || !password) {
        setError('Please enter email and password');
        return;
      }
      const user = authService.login(email, password);
      if (user) {
        onAuthSuccess(user);
      } else {
        setError('Invalid email or password. Please try again.');
      }
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
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5D4E] outline-none"
              placeholder="e.g. John Doe"
            />
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
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5D4E] outline-none"
            placeholder="••••••••"
          />
        </div>

        {isRegistering && (
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Grade Taught</label>
            <select 
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5D4E] outline-none bg-white"
            >
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        )}

        {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded-lg text-center font-medium">{error}</p>}

        <button 
          type="submit"
          className="w-full py-4 bg-[#2E5D4E] text-white font-bold rounded-xl hover:bg-[#254a3e] transition-all shadow-lg"
        >
          {isRegistering ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <button 
          onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
          className="text-[#2E5D4E] font-medium hover:underline"
        >
          {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register here"}
        </button>
      </div>
    </div>
  );
};
