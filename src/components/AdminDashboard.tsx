import React, { useState, useEffect, useMemo } from 'react';
import { authService } from '../services/authService';
import { emailService } from '../services/emailService';
import { configService } from '../services/configService';
import { uploadQuestionsToFirestore } from '../utils/seedDatabase';
import { generateCertificate } from '../utils/certificateGenerator';
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
  const [isSeeding, setIsSeeding] = useState(false);
  const [showTeachersReport, setShowTeachersReport] = useState(false);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const allUsers = await authService.getAllUsers();
        // Only show users that haven't been soft-deleted
        setUsers(allUsers.filter(u => !u.isDeleted));
        
        const email = await configService.getAdminNotificationEmail();
        setAdminEmail(email);
      } catch (error) {
        console.error("Dashboard load error:", error);
        setStatusMessage({ text: 'Failed to load initial data from Firestore.', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- COMPUTED STATS ---
  // We process the raw user data to find their most recent passing result
  const stats = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return users.map(u => {
      const latestPass = u.results
        ?.filter(r => r.passed)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      const lastSuccessDate = latestPass ? new Date(latestPass.date) : null;
      const lastScore = latestPass ? latestPass.score : 0;
      let isExpired = true;

      if (lastSuccessDate) {
        const expiryDate = new Date(lastSuccessDate);
        expiryDate.setDate(expiryDate.getDate() + 365); // Policy validity period
        expiryDate.setHours(0, 0, 0, 0);
        isExpired = now >= expiryDate;
      }

      return { ...u, isExpired, lastSuccessDate, lastScore };
    });
  }, [users]);

  const filteredStats = useMemo(() => stats.filter(s => {
    if (filter === 'outstanding') return s.isExpired;
    if (filter === 'passed') return !s.isExpired;
    return true;
  }), [stats, filter]);

  // --- ACTIONS ---
  
  // New Action: Generates and downloads the PDF Certificate
  const handleDownloadCertificate = async (user: any) => {
    try {
      setStatusMessage({ text: `Building certificate for ${user.firstName}...`, type: 'success' });
      
      // We await the response because the generator now fetches the logo via Base64
      const dataUri = await generateCertificate(getFullName(user), user.lastScore || 100);
      
      // Create a virtual link to trigger the browser download
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = `GBC_Certificate_${user.lastName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      setStatusMessage({ text: 'Error generating PDF. Check if logo.png exists in public folder.', type: 'error' });
    }
  };

  const handleSeedDatabase = async () => {
    const confirmed = window.confirm(
      "This will upload the 49 finalized questions from your constants file to Firestore. \n\nNote: Question #2 will be skipped as requested. Continue?"
    );

    if (!confirmed) return;

    setIsSeeding(true);
    try {
      await uploadQuestionsToFirestore();
      setStatusMessage({ text: 'Successfully seeded the database with 49 questions!', type: 'success' });
    } catch (error) {
      console.error("Failed to seed database:", error);
      setStatusMessage({ text: 'Failed to seed database. Check console for details.', type: 'error' });
    } finally {
      setIsSeeding(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const sendReminders = async () => {
    const outstandingUsers = stats.filter(s => s.isExpired && s.intendToTeach);

    if (outstandingUsers.length === 0) {
      setStatusMessage({ text: 'No outstanding users to remind.', type: 'success' });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    setStatusMessage({ text: `Sending ${outstandingUsers.length} reminders...`, type: 'success' });
    await emailService.sendBulkReminderEmail(outstandingUsers);
    setStatusMessage({ text: 'Reminder emails have been sent successfully!', type: 'success' });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const onToggleAdmin = async (user: User) => {
    const userName = getFullName(user);
    const newAdminStatus = !user.isAdmin;
    const action = newAdminStatus ? 'grant admin privileges to' : 'remove admin privileges from';

    if (window.confirm(`Are you sure you want to ${action} ${userName}?`)) {
      try {
        await authService.updateUserAdminStatus(user.id, newAdminStatus);
        setUsers(prevUsers =>
          prevUsers.map(u => (u.id === user.id ? { ...u, isAdmin: newAdminStatus } : u))
        );
        setStatusMessage({ text: `Successfully updated admin status for ${userName}.`, type: 'success' });
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
    const confirmed = window.confirm(`Are you sure you want to remove ${userName}? This will mark them as inactive.`);
    
    if (confirmed) {
      try {
        await emailService.sendAccountDeletedEmail(user);
        await authService.deleteUser(user.id);
        setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
        setStatusMessage({ text: `Account for ${userName} has been removed.`, type: 'success' });
      } catch (e) {
        setStatusMessage({ text: `Error removing user.`, type: 'error' });
      }
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleSaveAdminEmail = async () => {
    setIsSavingEmail(true);
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
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {showTeachersReport && (
        <TeachersReport
          users={users}
          onClose={() => setShowTeachersReport(false)}
        />
      )}

      {/* --- HEADER STATS CARD --- */}
      <div className="bg-[#2E5D4E] p-8 rounded-2xl shadow-xl text-white">
        <h2 className="text-3xl font-bold mb-2">Church Administration Reports</h2>
        <p className="opacity-80 mb-6">Monitoring compliance across all children's ministry staff.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white bg-opacity-10 p-4 rounded-xl">
            <span className="text-3xl font-black block text-white">{stats.length}</span>
            <span className="text-xs font-bold uppercase tracking-widest opacity-60 text-lime-400">Total Staff</span>
          </div>
          <div className="bg-white bg-opacity-10 p-4 rounded-xl">
            <span className="text-3xl font-black block text-white">{stats.filter(s => !s.isExpired).length}</span>
            <span className="text-xs font-bold uppercase tracking-widest opacity-60 text-lime-400">Valid Certifications</span>
          </div>
          <div className="bg-white bg-opacity-10 p-4 rounded-xl">
            <span className="text-3xl font-black block text-red-200">{stats.filter(s => s.isExpired).length}</span>
            <span className="text-xs font-bold uppercase tracking-widest opacity-60 text-lime-400">Outstanding / Expired</span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl font-bold text-center animate-fade-in ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
          {statusMessage.text}
        </div>
      )}

      {/* --- DATABASE MAINTENANCE --- */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-blue-900">Database Maintenance</h3>
          <p className="text-sm text-blue-700">Initialize the live Quiz collection with the 49 finalized policy questions.</p>
        </div>
        <button
          onClick={handleSeedDatabase}
          disabled={isSeeding}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {isSeeding ? 'Seeding...' : '🚀 Initialize Question Pool'}
        </button>
      </div>

      {/* --- SYSTEM SETTINGS --- */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-700 mb-2">System Settings</h3>
        <div className="flex items-center gap-4">
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            className="flex-grow px-4 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-[#2E5D4E]"
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

      {/* --- STAFF TABLE --- */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center bg-gray-50 gap-4">
          <div className="flex bg-gray-200 p-1 rounded-lg">
            {(['all', 'outstanding', 'passed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1 rounded-md text-xs font-bold uppercase transition-all ${filter === f ? 'bg-white text-[#2E5D4E] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-4">
            <button onClick={() => setShowTeachersReport(true)} className="px-6 py-2 bg-blue-500 text-white rounded-lg font-bold text-sm hover:bg-blue-600 transition-all">
              Teachers Report
            </button>
            <button onClick={sendReminders} className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold text-sm hover:bg-red-600 transition-all flex items-center gap-2">
              Send Bulk Reminders
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b">
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
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800">{getFullName(s)}</p>
                    <p className="text-xs text-gray-400">{s.email}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {s.intendToTeach ? <span className="text-green-500 font-bold">YES</span> : <span className="text-gray-300">NO</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {s.lastSuccessDate ? s.lastSuccessDate.toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {s.isExpired ? 'Expired' : 'Valid'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input type="checkbox" checked={s.isAdmin} onChange={() => onToggleAdmin(s)} className="h-4 w-4 rounded border-gray-300 text-[#2E5D4E] focus:ring-[#2E5D4E]" />
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    {/* Only show Print Certificate button if they have a valid (not expired) success date */}
                    {!s.isExpired && (
                      <button
                        onClick={() => handleDownloadCertificate(s)}
                        className="text-blue-500 hover:text-blue-700 transition-colors p-2 rounded-lg hover:bg-blue-50"
                        title="Print Certificate"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(s)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                      title="Delete User"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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