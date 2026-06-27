import React, { useEffect, useState } from 'react';
import api from '../../api';
import Layout from '../../components/Layout';
import { 
  User as UserIcon, CheckCircle, XCircle, Trash2, Search, Loader2, 
  Shield, UserCheck, UserMinus, Mail, Clock, Edit2, Check, X, Globe, Users 
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // Emma AI access states
  const [globalSettings, setGlobalSettings] = useState({});
  const [groups, setGroups] = useState([]);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [groupInputVal, setGroupInputVal] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUsers(),
        fetchSettings(),
        fetchGroups()
      ]);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const res = await api.get('/admin/users');
    setUsers(res.data);
  };

  const fetchSettings = async () => {
    const res = await api.get('/admin/settings');
    setGlobalSettings(res.data);
  };

  const fetchGroups = async () => {
    const res = await api.get('/admin/users/groups');
    setGroups(res.data);
  };

  const handleToggleApproval = async (id) => {
    setProcessingId(id);
    try {
      await api.put(`/admin/users/${id}/approve`);
      await fetchUsers();
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
      await fetchUsers();
      await fetchGroups();
    } catch (err) {
      alert('Failed to delete user');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleGlobalEmmaAccess = async () => {
    const currentStatus = globalSettings['emma_global_access'] !== 'false';
    const newStatus = !currentStatus;
    try {
      await api.post('/admin/settings', { key: 'emma_global_access', value: String(newStatus) });
      await fetchSettings();
    } catch (err) {
      alert('Failed to update global settings');
    }
  };

  const handleToggleGroupEmmaAccess = async (groupName) => {
    const isCurrentlyDisabled = globalSettings[`emma_group_disabled_${groupName}`] === 'true';
    try {
      if (isCurrentlyDisabled) {
        await api.delete(`/admin/settings/emma_group_disabled_${groupName}`);
      } else {
        await api.post('/admin/settings', { key: `emma_group_disabled_${groupName}`, value: 'true' });
      }
      await fetchSettings();
    } catch (err) {
      alert('Failed to update group settings');
    }
  };

  const handleToggleUserEmmaAccess = async (id) => {
    setProcessingId(id);
    try {
      await api.put(`/admin/users/${id}/emma-access`);
      await fetchUsers();
    } catch (err) {
      alert('Failed to update user Emma AI access');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveUserGroup = async (id, groupName) => {
    try {
      await api.put(`/admin/users/${id}/group`, { groupName });
      setEditingGroupId(null);
      await fetchUsers();
      await fetchGroups();
    } catch (err) {
      alert('Failed to update user group');
    }
  };

  const getDisplayName = (user) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.name || 'User';
  };

  const getInitials = (user) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`;
    }
    if (user.name) {
      const parts = user.name.trim().split(/\s+/);
      if (parts.length > 1) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`;
      }
      return parts[0].charAt(0);
    }
    return '?';
  };

  const filteredUsers = users.filter(user => {
    const fullName = getDisplayName(user).toLowerCase();
    const email = user.email?.toLowerCase() || '';
    const group = user.groupName?.toLowerCase() || '';
    const query = searchTerm.toLowerCase();
    return fullName.includes(query) || email.includes(query) || group.includes(query);
  });

  const pendingCount = users.filter(u => !u.approved && u.role !== 'ADMIN').length;

  if (loading) return <Layout><div className="p-8 font-bold text-gray-500">Loading user management dashboard...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900">User Management</h1>
            <p className="text-gray-500 font-medium">Approve new students, edit study groups, and configure Emma AI access settings.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {pendingCount > 0 && (
              <div className="bg-amber-50 border border-amber-100 px-6 py-3 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-black">
                  {pendingCount}
                </div>
                <p className="text-amber-800 font-bold text-sm">Pending Approval</p>
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Search by name, email or group..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-[300px] font-medium transition-all"
              />
            </div>
          </div>
        </header>

        {/* EMMA AI ACCESS CONTROLS SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Global Emma Access */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black">
                  🤖
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900">Global Emma AI Access</h2>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">System-Wide Access Control</p>
                </div>
              </div>
              <p className="text-gray-500 font-medium text-sm leading-relaxed mb-6">
                Instantly enable or disable Emma AI (conversational practice and audio transcription) for all students on the platform.
              </p>
            </div>
            
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
              <span className="font-bold text-gray-700 text-xs flex items-center gap-2">
                <Globe size={14} className="text-gray-400" />
                Global Status
              </span>
              <button
                onClick={handleToggleGlobalEmmaAccess}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  globalSettings['emma_global_access'] !== 'false'
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-100'
                    : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-100'
                }`}
              >
                {globalSettings['emma_global_access'] !== 'false' ? 'Active for All' : 'Disabled for All'}
              </button>
            </div>
          </div>

          {/* Card 2: Group Emma Access */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-50 border border-purple-100 text-purple-600 rounded-2xl flex items-center justify-center font-black">
                  👥
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900">Group Access Policies</h2>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Group-Level Restrictions</p>
                </div>
              </div>
              <p className="text-gray-500 font-medium text-sm leading-relaxed mb-4">
                Revoke or grant Emma AI access for whole cohorts/groups. Revoking a group disables chat for all its members.
              </p>
            </div>

            <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
              {groups.length === 0 ? (
                <div className="text-center py-5 text-xs font-bold text-gray-400 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                  No groups detected. Create one by assigning a group tag to a user.
                </div>
              ) : (
                groups.map(group => {
                  const isGroupDisabled = globalSettings[`emma_group_disabled_${group}`] === 'true';
                  return (
                    <div key={group} className="flex items-center justify-between bg-gray-50/50 px-4 py-2.5 rounded-xl border border-gray-100">
                      <span className="font-bold text-gray-700 text-xs flex items-center gap-2">
                        <Users size={12} className="text-gray-400" />
                        {group}
                      </span>
                      <button
                        onClick={() => handleToggleGroupEmmaAccess(group)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                          !isGroupDisabled
                            ? 'bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200'
                            : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-100'
                        }`}
                      >
                        {!isGroupDisabled ? 'Allowed' : 'Blocked'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* USERS TABLE LIST */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">User & Group</th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Role</th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Emma AI Access</th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Approval Status</th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user, i) => {
                  const isUserEmmaAccess = user.emmaAccess !== false;
                  const isGroupEmmaDisabled = user.groupName ? globalSettings[`emma_group_disabled_${user.groupName}`] === 'true' : false;
                  const isGlobalEmmaDisabled = globalSettings['emma_global_access'] === 'false';
                  const hasAccess = user.role === 'ADMIN' || (isUserEmmaAccess && !isGroupEmmaDisabled && !isGlobalEmmaDisabled);

                  return (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm mt-1 flex-shrink-0 ${
                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {getInitials(user)}
                          </div>
                          <div className="space-y-1">
                            <div className="font-bold text-gray-900 flex items-center gap-2">
                              {getDisplayName(user)}
                              {user.role === 'ADMIN' && <Shield size={14} className="text-purple-500" />}
                            </div>
                            <div className="text-xs text-gray-400 font-medium flex items-center gap-1">
                               <Mail size={12} /> {user.email}
                            </div>
                            
                            {/* Group Tag & Edit Option */}
                            {user.role !== 'ADMIN' && (
                              <div className="pt-1 text-xs">
                                {editingGroupId === user.id ? (
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <input
                                      type="text"
                                      value={groupInputVal}
                                      onChange={(e) => setGroupInputVal(e.target.value)}
                                      placeholder="Ex: Cohorte A"
                                      className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleSaveUserGroup(user.id, groupInputVal)}
                                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                      title="Save Group"
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button
                                      onClick={() => setEditingGroupId(null)}
                                      className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg transition-all"
                                      title="Cancel"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 mt-1 text-slate-500 font-bold">
                                    <span>Groupe:</span>
                                    {user.groupName ? (
                                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] uppercase font-black tracking-wider">
                                        {user.groupName}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-gray-300 italic font-medium">None</span>
                                    )}
                                    <button
                                      onClick={() => {
                                        setEditingGroupId(user.id);
                                        setGroupInputVal(user.groupName || '');
                                      }}
                                      className="text-blue-500 hover:text-blue-700 hover:underline p-0.5"
                                      title="Edit Group"
                                    >
                                      <Edit2 size={10} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-500' : 'bg-blue-50 text-blue-500'}`}>
                          {user.role}
                        </span>
                      </td>
                      
                      {/* Emma AI Access Column */}
                      <td className="px-8 py-6">
                        {(() => {
                          if (user.role === 'ADMIN') {
                            return (
                              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-50 text-purple-500">
                                Admin Allowed
                              </span>
                            );
                          }

                          let badgeClass = 'bg-green-50 text-green-600 border border-green-100';
                          let statusLabel = 'Access Active';
                          
                          if (!isUserEmmaAccess) {
                            badgeClass = 'bg-red-50 text-red-600 border border-red-100';
                            statusLabel = 'Blocked (User)';
                          } else if (isGroupEmmaDisabled) {
                            badgeClass = 'bg-amber-50 text-amber-600 border border-amber-100';
                            statusLabel = 'Blocked (Group)';
                          } else if (isGlobalEmmaDisabled) {
                            badgeClass = 'bg-amber-50 text-amber-600 border border-amber-100';
                            statusLabel = 'Blocked (Global)';
                          }

                          return (
                            <div className="flex flex-col items-start gap-1.5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeClass}`}>
                                {statusLabel}
                              </span>
                              <button
                                onClick={() => handleToggleUserEmmaAccess(user.id)}
                                disabled={processingId === user.id}
                                className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 hover:underline mt-0.5"
                              >
                                {isUserEmmaAccess ? 'Block Individually' : 'Unblock Individually'}
                              </button>
                            </div>
                          );
                        })()}
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          {user.approved ? (
                            <div className="flex items-center gap-1.5 text-green-600 font-black text-xs uppercase">
                              <CheckCircle size={14} /> Approved
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-amber-500 font-black text-xs uppercase">
                              <Clock size={14} /> Pending
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          {user.role !== 'ADMIN' && (
                            <button 
                              onClick={() => handleToggleApproval(user.id)}
                              disabled={processingId === user.id}
                              className={`p-3 rounded-xl transition-all ${user.approved ? 'text-amber-500 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                              title={user.approved ? 'Disapprove User' : 'Approve User'}
                            >
                              {processingId === user.id ? <Loader2 className="animate-spin" size={20} /> : (user.approved ? <UserMinus size={20} /> : <UserCheck size={20} />)}
                            </button>
                          )}
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
                  );
                })}
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

export default AdminUserManagement;
