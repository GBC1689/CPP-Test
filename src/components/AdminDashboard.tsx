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
        expiryDate.setDate(expiryDate.getDate() + 365); // 1 Year Validity
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
  const handleDownloadCertificate = async (user: any) => {
    try {
      setStatusMessage({ text: `Building certificate for ${user.firstName}...`, type: 'success' });
      const dataUri = await generateCertificate(
        getFullName(user), 
        user.lastScore || 100, 
        user.lastSuccessDate
      );
      
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = `GBC_Certificate_${user.lastName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      setStatusMessage({ text: 'Error generating PDF. Check if logo.png exists.', type: 'error' });
    }
  };

  const handleSeedDatabase = async () => {
    if (!window.confirm("Initialize question pool (49 questions)?")) return;
    setIsSeeding(true);
    try {
      await uploadQuestionsToFirestore();
      setStatusMessage({ text: 'Successfully seeded database!', type: 'success' });
    } catch (error) {
      setStatusMessage({ text: 'Failed to seed database.', type: 'error' });
    } finally {
      setIsSeeding(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const sendReminders = async () => {
    const outstandingUsers = stats.filter(s => s.isExpired && s.intendToTeach);
    if (outstandingUsers.length === 0) {
      setStatusMessage({ text: 'No outstanding users to remind.', type: 'success' });
      return;
    }
    setStatusMessage({ text: `Sending ${outstandingUsers.length} reminders...`, type: 'success' });
    await emailService.sendBulkReminderEmail(outstandingUsers);
    setStatusMessage({ text: 'Reminders sent!', type: 'success' });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const onToggleAdmin = async (user: User) => {
    const newAdminStatus = !user.isAdmin;
    if (window.confirm(`Update admin status for ${getFullName(user)}?`)) {
      try {
        await authService.updateUserAdminStatus(user.id, newAdminStatus);
        setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, isAdmin: newAdminStatus } : u)));
      } catch (error) {
        setStatusMessage({ text: 'Update failed.', type: 'error' });
      }
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.isAdmin) return alert('Remove admin status before deleting.');
    if (window.confirm(`Remove ${getFullName(user)}?`)) {
      try {
        await emailService.sendAccountDeletedEmail(user);
        await authService.deleteUser(user.id);
        setUsers(prev => prev.filter(u => u.id !== user.id));
      } catch (e) {
        setStatusMessage({ text: `Error removing user.`, type: 'error' });
      }
    }
  };

  const handleSaveAdminEmail = async () => {
    setIsSavingEmail(true);
    const success = await configService.setAdminNotificationEmail(adminEmail);
    setStatusMessage({ text: success ? 'Email updated!' : 'Update failed.', type: success ? 'success' : 'error' });
    setIsSavingEmail(false);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  if (isLoading) return <div className="text-center p-12">Loading Admin Data...</div>;

  return (
    <div className="space-y-8 pb-20">
      {showTeachersReport && <TeachersReport users={users} onClose={() => setShowTeachersReport(false)} />}

      {/* --- HEADER STATS CARD --- */}
      <div className="bg-[#2E5D4E] p-8 rounded-2xl shadow-xl text-white">
        <h2 className="text-3xl font-bold mb-2">Church Administration Reports</h2>
        <p className="opacity-80 mb-6 text-green-50">Monitoring compliance across all children's ministry staff.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl shadow-inner">
            <span className="text-3xl font-black block text-gray-800">{stats.length}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#2E5D4E]">Total Staff</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-inner border-l-4 border-[#2E5D4E]">
            <span className="text-3xl font-black block text-[#2E5D4E]">{stats.filter(s => !s.isExpired).length}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Valid Certs</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-inner border-l-4 border-[#CE2029]">
            <span className="text-3xl font-black block text-[#CE2029]">{stats.filter(s => s.isExpired).length}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Outstanding</span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl font-bold text-center animate-pulse ${statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {statusMessage.text}
        </div>
      )}

      {/* System Settings & Maintenance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-700 mb-2">Admin Notification Email</h3>
          <div className="flex items-center gap-4">
            <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="flex-grow px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2E5D4E]" />
            <button onClick={handleSaveAdminEmail} disabled={isSavingEmail} className="px-6 py-2 bg-[#2E5D4E] text-white rounded-lg font-bold hover:bg-[#254a3e]">
              {isSavingEmail ? 'Saving...' : 'Update'}
            </button>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-blue-900">Quiz Database</h3>
            <p className="text-sm text-blue-700">Restore/Sync question pool</p>
          </div>
          <button onClick={handleSeedDatabase} disabled={isSeeding} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">
            {isSeeding ? 'Seeding...' : 'Initialize Pool'}
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex bg-gray-200 p-1 rounded-lg">
            {(['all', 'outstanding', 'passed'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1 rounded-md text-xs font-bold uppercase transition-all ${filter === f ? 'bg-white text-[#2E5D4E] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="flex gap-4">
            <button onClick={() => setShowTeachersReport(true)} className="px-6 py-2 bg-blue-500 text-white rounded-lg font-bold text-sm shadow-md hover:bg-blue-600">Teachers Report</button>
            <button onClick={sendReminders} className="px-6 py-2 bg-[#CE2029] text-white rounded-lg font-bold text-sm shadow-md hover:bg-[#b01b22]">Send Bulk Reminders</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white text-left text-[10px] font-bold text-gray-400 uppercase border-b tracking-tighter">
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
                    {/* CATCH-ALL: Added 'capitalize' class here for UI display */}
                    <p className="font-bold text-gray-800 capitalize">{getFullName(s)}</p>
                    <p className="text-xs text-gray-400">{s.email}</p>
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-gray-600">{s.intendToTeach ? 'YES' : 'NO'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.lastSuccessDate ? s.lastSuccessDate.toLocaleDateString('en-GB') : 'Never'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${s.isExpired ? 'bg-red-100 text-[#CE2029]' : 'bg-green-100 text-[#2E5D4E]'}`}>
                      {s.isExpired ? 'Expired' : 'Valid'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input type="checkbox" checked={s.isAdmin} onChange={() => onToggleAdmin(s)} className="w-4 h-4 text-[#2E5D4E] border-gray-300 rounded focus:ring-[#2E5D4E]" />
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    {!s.isExpired && (
                      <button onClick={() => handleDownloadCertificate(s)} title="Download Certificate" className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                      </button>
                    )}
                    <button onClick={() => handleDeleteUser(s)} title="Delete Account" className="text-gray-400 hover:text-[#CE2029] p-2 hover:bg-red-50 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};