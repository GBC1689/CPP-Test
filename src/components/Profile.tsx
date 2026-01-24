import React, { useState } from 'react';
import { User } from '../types.ts';
import { authService } from '../services/authService.ts';

interface ProfileProps {
  user: User;
  onUpdate: () => void;
}

const GRADES = ["Nursery", "Pre-School", "Grade R", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Youth", "Administration"];

export const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
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
      await authService.updateUserProfile(user.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gradeTaught: grade,
        intendToTeach,
        ...(password ? { password } : {})
      });
      
      setSaved(true);
      await onUpdate(); 
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

        {/* Row 3: Password Update with Custom Icons */}
        <div className="relative">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 text-left">Access Password (Optional)</label>
          <div className="relative">
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
              className="absolute inset-y-0 right-0 px-4 flex items-center"
            >
              <img 
                src={showPassword ? "open.ico" : "closed.ico"} 
                alt={showPassword ? "Hide" : "Show"} 
                className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity"
              />
            </button>
          </div>
        </div>

        {/* Row 4: Intent Checkbox */}
        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
           <input 
            type="checkbox" 
            id="intend" 
            checked={intendToTeach}
            onChange={(e) => setIntendToTeach(e.target.checked)}
            className="w-5 h-5 accent-[#2E5D4E] cursor-pointer"
           />
           <label htmlFor="intend" className="text-sm font-bold text-blue-900 cursor-pointer">
             I still intend to teach/volunteer in children's ministry for the current year.
           </label>
        </div>

        {/* Row 5: Action Button */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`px-8 py-3 bg-[#2E5D4E] text-white rounded-xl font-bold transition-all shadow-md ${isSaving ? 'opacity-50' : 'hover:bg-[#254a3e] hover:shadow-lg'}`}
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