import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import Layout from '../../components/Layout';
import { User as UserIcon, CheckCircle, XCircle, Trash2, Search, Loader2, Shield, UserCheck, UserMinus, Settings, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminUsers = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [defaultApproval, setDefaultApproval] = useState('pending');
  const [updatingSetting, setUpdatingSetting] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchDefaultApproval();
  }, []);

  const fetchDefaultApproval = async () => {
    try {
      const res = await api.get('/admin/settings/default-user-approval');
      setDefaultApproval(res.data.value);
    } catch (err) {
      console.error('Failed to fetch default approval setting', err);
    }
  };

  const handleUpdateDefaultApproval = async (value) => {
    setUpdatingSetting(true);
    try {
      await api.put('/admin/settings/default-user-approval', { value });
      setDefaultApproval(value);
    } catch (err) {
      alert(t('admin_default_approval_error'));
    } finally {
      setUpdatingSetting(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (id) => {
    setProcessingId(id);
    try {
      await api.put(`/admin/users/${id}/approve`);
      fetchUsers();
    } catch (err) {
      alert('Failed to update user status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setProcessingId(id);
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Layout><div className="p-8">Loading users...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900">User Management</h1>
            <p className="text-gray-500 font-medium">Approve new students and manage account access.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-[300px] font-medium transition-all"
            />
          </div>
        </header>

        {/* Default Approval Status Setting */}
        <motion.div
          initial={{ opacity: 1, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-[2rem] border border-indigo-100 p-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-100 rounded-2xl">
              <Settings className="text-indigo-600" size={24} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-gray-900">{t('admin_default_approval_title')}</h3>
                <AlertCircle className="text-indigo-500" size={18} />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {t('admin_default_approval_desc')}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleUpdateDefaultApproval('pending')}
                  disabled={updatingSetting}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                    defaultApproval === 'pending'
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                      : 'bg-white text-gray-600 hover:bg-amber-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <XCircle size={18} />
                    <span>{t('admin_pending_approval')}</span>
                  </div>
                </button>
                <button
                  onClick={() => handleUpdateDefaultApproval('approved')}
                  disabled={updatingSetting}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${
                    defaultApproval === 'approved'
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                      : 'bg-white text-gray-600 hover:bg-green-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle size={18} />
                    <span>{t('admin_auto_approved')}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">User</th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Role</th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user, i) => (
                  <motion.tr 
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 flex items-center gap-2">
                            {user.firstName} {user.lastName}
                            {user.role === 'ADMIN' && <Shield size={14} className="text-purple-500" />}
                          </div>
                          <div className="text-sm text-gray-400 font-medium">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-500' : 'bg-blue-50 text-blue-500'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        {user.approved ? (
                          <div className="flex items-center gap-1.5 text-green-600 font-black text-xs uppercase">
                            <CheckCircle size={14} /> Approved
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-500 font-black text-xs uppercase">
                            <XCircle size={14} /> Pending
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleToggleApproval(user.id)}
                          disabled={processingId === user.id}
                          className={`p-3 rounded-xl transition-all ${user.approved ? 'text-amber-500 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={user.approved ? 'Disapprove' : 'Approve'}
                        >
                          {processingId === user.id ? <Loader2 className="animate-spin" size={20} /> : (user.approved ? <UserMinus size={20} /> : <UserCheck size={20} />)}
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={processingId === user.id}
                          className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete User"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="p-20 text-center text-gray-400 font-medium bg-gray-50/50">
              {searchTerm ? `No users matching "${searchTerm}"` : 'No users found.'}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminUsers;
