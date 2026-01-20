
import React, { useState } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface ProfileProps {
  user: User;
  onUpdate: () => void;
}

const GRADES = ["Nursery", "Pre-School", "Grade R", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Youth", "Administration"];

export const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [grade, setGrade] = useState(user.gradeTaught);
  const [intendToTeach, setIntendToTeach] = useState(user.intendToTeach);
  const [password, setPassword] = useState(user.password || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    authService.updateUser(user.id, {
      name,
      gradeTaught: grade,
      intendToTeach,
      password
    });
    setSaved(true);
    onUpdate();
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5D4E] outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Grade You Teach</label>
          <select 
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5D4E] outline-none bg-white"
          >
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Access Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5D4E] outline-none"
            placeholder="Change your password"
          />
        </div>

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

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <button 
            onClick={handleSave}
            className="px-8 py-3 bg-[#2E5D4E] text-white rounded-xl font-bold hover:bg-[#254a3e] transition-all"
          >
            Save Changes
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
