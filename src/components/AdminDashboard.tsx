
import React, { useState, useEffect, useMemo } from 'react';
import { authService } from '../services/authService';
import { emailService } from '../services/emailService';
import { configService } from '../services/configService';
import { User } from '../types';
import { TeachersReport } from './TeachersReport';

// Helper to get a consistent full name
const getFullName = (user: User) => `${user.firstName || ''} ${user.lastName || ''}`.trim();

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'outstanding' | 'passed'>('all');
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [showTeachersReport, setShowTeachersReport] = useState(false);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const allUsers = await authService.getAllUsers();
        setUsers(allUsers.filter(u => !u.isDeleted));
        const email = await configService.getAdminNotificationEmail();
        setAdminEmail(email);
      } catch (error) {
        setStatusMessage({ text: 'Failed to load initial data.', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- COMPUTED STATS ---
  const stats = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of day for consistent comparison

    return users.map(u => {
      const latestPass = u.results
        ?.filter(r => r.passed)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      const lastSuccessDate = latestPass ? new Date(latestPass.date) : null;
      let isExpired = true;

      if (lastSuccessDate) {
        const expiryDate = new Date(lastSuccessDate);
        expiryDate.setDate(expiryDate.getDate() + 365); // Use 365 days for consistency
        expiryDate.setHours(0, 0, 0, 0);

        isExpired = now >= expiryDate;
      }

      return { ...u, isExpired, lastSuccessDate };
    });
  }, [users]);

  const filteredStats = useMemo(() => stats.filter(s => {
    if (filter === 'outstanding') return s.isExpired;
    if (filter === 'passed') return !s.isExpired;
    return true;
  }), [stats, filter]);

  // --- ACTIONS ---
  const sendReminders = async () => {
    const outstandingUsers = stats.filter(s => s.isExpired && s.intendToTeach);

    if (outstandingUsers.length === 0) {
      setStatusMessage({ text: 'No outstanding users to remind.', type: 'success' });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    setStatusMessage({ text: `Sending ${outstandingUsers.length} reminders...`, type: 'success' });

    // This would be a real bulk email operation
    await emailService.sendBulkReminderEmail(outstandingUsers);
    
    setStatusMessage({ text: 'Reminder emails have been sent successfully!', type: 'success' });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const onToggleAdmin = async (user: User) => {
    const userName = getFullName(user);
    const newAdminStatus = !user.isAdmin;
    const action = newAdminStatus ? 'grant admin privileges to' : 'remove admin privileges from';

    const confirmed = window.confirm(`Are you sure you want to ${action} ${userName}?`);

    if (confirmed) {
      try {
        await authService.updateUserAdminStatus(user.id, newAdminStatus);
        setUsers(prevUsers =>
          prevUsers.map(u => (u.id === user.id ? { ...u, isAdmin: newAdminStatus } : u))
        );
        setStatusMessage({
          text: `Successfully updated admin status for ${userName}.`,
          type: 'success',
        });
      } catch (error) {
        setStatusMessage({ text: 'Failed to update admin status.', type: 'error' });
      }
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.isAdmin) {
      alert('You cannot delete a user who is an admin. Please remove their admin status first.');
      return;
    }

    const userName = getFullName(user);
    const confirmed = window.confirm(`Are you sure you want to remove ${userName}? This will mark them as inactive and they will no longer appear here. A final notification email will be sent.`);
    
    if (confirmed) {
      try {
        // 1. Send notification email first
        await emailService.sendAccountDeletedEmail(user);
        
        // 2. Perform the soft delete in the database
        await authService.deleteUser(user.id);
        
        // 3. Optimistically update the UI for a fast response
        setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
        
        setStatusMessage({ text: `Account for ${userName} has been removed.`, type: 'success' });
      } catch (e) {
        setStatusMessage({ text: `Error removing user. Please try again.`, type: 'error' });
      }
      
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-12 bg-white rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-600">Loading Admin Dashboard...</h2>
        <p className="text-gray-400">Fetching user compliance data from Firestore.</p>
      </div>
    );
  }

  const handleSaveAdminEmail = async () => {
    setIsSavingEmail(true);
    setStatusMessage(null);
    const success = await configService.setAdminNotificationEmail(adminEmail);
    if (success) {
      setStatusMessage({ text: 'Admin email updated successfully!', type: 'success' });
    } else {
      setStatusMessage({ text: 'Failed to update admin email.', type: 'error' });
    }
    setIsSavingEmail(false);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  if (isLoading) {
    return (
      <div className="text-center p-12 bg-white rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-600">Loading Admin Dashboard...</h2>
        <p className="text-gray-400">Fetching user compliance data from Firestore.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {showTeachersReport && (
        <TeachersReport
          users={users}
          onClose={() => setShowTeachersReport(false)}
        />
      )}
      <div className="bg-[#2E5D4E] p-8 rounded-2xl shadow-xl text-white">
        <h2 className="text-3xl font-bold mb-2">Church Administration Reports</h2>
        <p className="opacity-80 mb-6">Monitoring compliance across all children's ministry staff.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white bg-opacity-10 p-4 rounded-xl">
            <span className="text-3xl font-black block text-black">{stats.length}</span>
            <span className="text-xs font-bold uppercase tracking-widest opacity-60 text-[#2E5D4E]">Total Staff</span>
          </div>
          <div className="bg-white bg-opacity-10 p-4 rounded-xl">
            <span className="text-3xl font-black block text-[#254a3e]">{stats.filter(s => !s.isExpired).length}</span>
            <span className="text-xs font-bold uppercase tracking-widest opacity-60 text-[#2E5D4E]">Valid Certifications</span>
          </div>
          <div className="bg-white bg-opacity-10 p-4 rounded-xl">
            <span className="text-3xl font-black block text-[#CE2029]">{stats.filter(s => s.isExpired).length}</span>
            <span className="text-xs font-bold uppercase tracking-widest opacity-60 text-[#2E5D4E]">Outstanding / Expired</span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl font-bold text-center animate-fade-in ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
          {statusMessage.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {(['all', 'outstanding', 'passed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-white text-[#2E5D4E] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowTeachersReport(true)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg font-bold text-sm hover:bg-blue-600 transition-all flex items-center gap-2"
            >
              Teachers
            </button>
            <button
              onClick={sendReminders}
              className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold text-sm hover:bg-red-600 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
              Send Bulk Reminders
            </button>
          </div>
        </div>


        <div className="overflow-x-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mt-8">
        <h3 className="text-lg font-bold text-gray-700 mb-2">System Settings</h3>
        <p className="text-sm text-gray-500 mb-4">Configure email addresses for system notifications.</p>
        <div className="flex items-center gap-4">
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            className="flex-grow px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2E5D4E] outline-none"
            placeholder="Enter admin notification email"
          />
          <button
            onClick={handleSaveAdminEmail}
            disabled={isSavingEmail}
            className="px-6 py-2 bg-[#2E5D4E] text-white rounded-lg font-bold text-sm hover:bg-[#254a3e] transition-all disabled:opacity-50"
          >
            {isSavingEmail ? 'Saving...' : 'Save Email'}
          </button>
        </div>
      </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4 text-center">Intends to Teach</th>
                <th className="px-6 py-4">Last Success</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Admin</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStats.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800">{getFullName(s)}</p>
                    <p className="text-xs text-gray-400">{s.email}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {s.intendToTeach ? (
                      <span className="text-green-500 font-bold text-xs uppercase">Yes</span>
                    ) : (
                      <span className="text-gray-300 font-bold text-xs uppercase">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {s.lastSuccessfulTestDate ? new Date(s.lastSuccessfulTestDate).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {s.isExpired ? 'Expired' : 'Valid'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={s.isAdmin}
                      onChange={() => onToggleAdmin(s)}
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteUser(s)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                      title="Delete User Account"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStats.length === 0 && (
            <div className="p-12 text-center text-gray-400 italic">No matching records found.</div>
          )}
        </div>
      </div>
    </div>
  );
};
