import React, { useState } from 'react';
import { User } from '../types.ts';
import { authService } from '../services/authService.ts';

interface ProfileProps {
  user: User;
  onUpdate: () => void;
}

const GRADES = ["Nursery", "Pre-School", "Grade R", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Youth", "Administration"];

export const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  // Logic Fix: We now use firstName and lastName to match the User type
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [grade, setGrade] = useState(user.gradeTaught || '');
  const [intendToTeach, setIntendToTeach] = useState(user.intendToTeach ?? true);
  const [password, setPassword] = useState(''); 
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      alert("First name and last name are required.");
      return;
    }
    setIsSaving(true);
    try {
      // Logic Fix: Calling the correct function name from authService.ts
      await authService.updateUserProfile(user.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gradeTaught: grade,
        intendToTeach,
        ...(password ? { password } : {})
      });
      
      setSaved(true);
      await onUpdate(); // This triggers the refresh in App.tsx
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h2>
      
      <div className="space-y-6">
        {/* Row 1: First and Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 text-left">First Name</label>
            <input 
              type="text" 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5D4E] outline-none"
              placeholder="First Name"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 text-left">Last Name</label>
            <input 
              type="text" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5D4E] outline-none"
              placeholder="Last Name"
            />
          </div>
        </div>

        {/* Row 2: Grade Taught */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 text-left">Grade You Teach</label>
          <select 
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5D4E] outline-none bg-white"
          >
            <option value="">Select Grade</option>
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* Row 3: Password Update */}
        <div className="relative">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 text-left">Access Password (Optional)</label>
          <input 
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5D4E] outline-none"
            placeholder="Enter new password to change"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 1.845 0 3.543.635 4.938 1.688l-1.938 1.938m-1.938-1.938a3 3 0 11-4.243 4.243m4.242-4.242L18.825 13.875M4.938 16.313a9.96 9.96 0 01-2.48-4.313C3.732 7.943 7.523 5 12 5c1.845 0 3.543.635 4.938 1.688m-1.938 1.938l-1.938-1.938m-1.938 1.938a3 3 0 01-4.243-4.243"></path></svg>
            )}
          </button>
        </div>

        {/* Row 4: Intent Checkbox */}
        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
           <input 
            type="checkbox" 
            id="intend" 
            checked={intendToTeach}
            onChange={(e) => setIntendToTeach(e.target.checked)}
            className="w-5 h-5 accent-[#2E5D4E]"
           />
           <label htmlFor="intend" className="text-sm font-bold text-blue-900">
             I still intend to teach/volunteer in children's ministry for the current year.
           </label>
        </div>

        {/* Row 5: Action Button */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`px-8 py-3 bg-[#2E5D4E] text-white rounded-xl font-bold transition-all ${isSaving ? 'opacity-50' : 'hover:bg-[#254a3e]'}`}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          
          {saved && (
            <span className="text-green-600 font-bold animate-pulse">
               Profile updated successfully!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};