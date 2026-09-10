import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import Layout from '../../components/Layout';
import {
  User as UserIcon, CheckCircle, XCircle, Trash2, Search, Loader2,
  Shield, UserCheck, UserMinus, Mail, Clock, Edit2, Check, X, Globe, Users,
  ChevronDown, ChevronUp, Settings, Award, Calendar, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminUserManagement = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // Emma AI access states
  const [globalSettings, setGlobalSettings] = useState({});
  const [groups, setGroups] = useState([]);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [groupInputVal, setGroupInputVal] = useState('');
  const [editingAccessId, setEditingAccessId] = useState(null);
  const [accessForm, setAccessForm] = useState({ enabled: true, startDate: '', endDate: '', revoked: false });

  // Default approval status states
  const [defaultApproval, setDefaultApproval] = useState('pending');
  const [updatingSetting, setUpdatingSetting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUsers(),
        fetchSettings(),
        fetchGroups(),
        fetchDefaultApproval()
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

  const handleEditEmmaAccess = (user) => {
    setEditingAccessId(user.id);
    setAccessForm({
      enabled: user.emmaAccess !== false,
      startDate: user.emmaAccessStartDate || '',
      endDate: user.emmaAccessEndDate || '',
      revoked: user.emmaAccessRevoked === true
    });
  };

const handleSaveEmmaAccessPlan = async (id) => {
  setProcessingId(id);
  try {
    const payload = {
      enabled: accessForm.enabled,
      startDate: accessForm.startDate || null,
      endDate: accessForm.endDate || null,
      revoked: accessForm.revoked
    };
    
    console.log('Sending payload:', payload); // Debug log
    
    const response = await api.put(`/admin/users/${id}/emma-access/plan`, payload);
    console.log('Response:', response.data);
    
    await fetchUsers();
    setEditingAccessId(null);
  } catch (err) {
    console.error('Full error:', err);
    console.error('Response data:', err.response?.data);
    console.error('Status code:', err.response?.status);
    alert('Failed to save Emma AI access plan: ' + (err.response?.data?.message || err.message));
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

  if (loading) return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading user management...</p>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage users, access controls, and permissions</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-700">
                  {pendingCount} pending {pendingCount === 1 ? 'approval' : 'approvals'}
                </span>
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none min-w-[240px] transition-shadow"
              />
            </div>
          </div>
        </header>

        {/* Default Approval Status Setting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
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

        {/* EMMA AI ACCESS CONTROLS SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Global Emma Access */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Global Access</h3>
                  <p className="text-xs text-gray-500">System-wide Emma AI control</p>
                </div>
              </div>
              <button
                onClick={handleToggleGlobalEmmaAccess}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  globalSettings['emma_global_access'] !== 'false'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {globalSettings['emma_global_access'] !== 'false' ? 'Active' : 'Disabled'}
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {globalSettings['emma_global_access'] !== 'false' 
                ? 'Emma AI is currently enabled for all users across the platform.'
                : 'Emma AI is currently disabled for all users across the platform.'}
            </p>
          </div>

          {/* Card 2: Group Emma Access */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Group Policies</h3>
                <p className="text-xs text-gray-500">Manage access by cohort</p>
              </div>
            </div>
            
            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {groups.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  No groups created yet
                </div>
              ) : (
                groups.map(group => {
                  const isGroupDisabled = globalSettings[`emma_group_disabled_${group}`] === 'true';
                  return (
                    <div key={group} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="text-xs font-medium text-gray-700">{group}</span>
                      <button
                        onClick={() => handleToggleGroupEmmaAccess(group)}
                        className={`px-3 py-1 rounded-md text-[10px] font-semibold transition-colors ${
                          !isGroupDisabled
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
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

        {/* USERS TABLE */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Emma AI</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user, i) => {
                  const today = new Date().toISOString().slice(0, 10);
                  const isUserEmmaAccess = user.emmaAccess !== false;
                  const isWithinActiveWindow = (!user.emmaAccessStartDate || today >= user.emmaAccessStartDate) && (!user.emmaAccessEndDate || today <= user.emmaAccessEndDate);
                  const isGroupEmmaDisabled = user.groupName ? globalSettings[`emma_group_disabled_${user.groupName}`] === 'true' : false;
                  const isGlobalEmmaDisabled = globalSettings['emma_global_access'] === 'false';
                  const hasAccess = user.role === 'ADMIN' || (isUserEmmaAccess && isWithinActiveWindow && !user.emmaAccessRevoked && !isGroupEmmaDisabled && !isGlobalEmmaDisabled);

                  return (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold ${
                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {getInitials(user)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {getDisplayName(user)}
                              </span>
                              {user.role === 'ADMIN' && (
                                <Shield className="w-3.5 h-3.5 text-purple-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{user.email}</span>
                            </div>
                            {user.role !== 'ADMIN' && (
                              <div className="mt-1">
                                {editingGroupId === user.id ? (
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="text"
                                      value={groupInputVal}
                                      onChange={(e) => setGroupInputVal(e.target.value)}
                                      placeholder="Group name"
                                      className="px-2 py-0.5 text-xs bg-white border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleSaveUserGroup(user.id, groupInputVal)}
                                      className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setEditingGroupId(null)}
                                      className="p-0.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    {user.groupName ? (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700">
                                        {user.groupName}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-gray-400">No group</span>
                                    )}
                                    <button
                                      onClick={() => {
                                        setEditingGroupId(user.id);
                                        setGroupInputVal(user.groupName || '');
                                      }}
                                      className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'ADMIN' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      
                      {/* Emma AI Access Column */}
                      <td className="px-6 py-4">
                        {(() => {
                          if (user.role === 'ADMIN') {
                            return (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                <Award className="w-3 h-3" />
                                Admin
                              </span>
                            );
                          }

                          let statusConfig = {
                            label: 'Active',
                            className: 'bg-green-100 text-green-700'
                          };
                          
                          if (!isUserEmmaAccess) {
                            statusConfig = { label: 'Blocked', className: 'bg-red-100 text-red-700' };
                          } else if (user.emmaAccessRevoked) {
                            statusConfig = { label: 'Revoked', className: 'bg-red-100 text-red-700' };
                          } else if (!isWithinActiveWindow) {
                            statusConfig = { label: 'Expired', className: 'bg-amber-100 text-amber-700' };
                          } else if (isGroupEmmaDisabled) {
                            statusConfig = { label: 'Group Blocked', className: 'bg-amber-100 text-amber-700' };
                          } else if (isGlobalEmmaDisabled) {
                            statusConfig = { label: 'Global Blocked', className: 'bg-amber-100 text-amber-700' };
                          }

                          return (
                            <div className="space-y-1.5">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
                                {statusConfig.label}
                              </span>
                              {editingAccessId === user.id ? (
                                <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-[10px] font-medium text-gray-600 block mb-0.5">Start</label>
                                      <input
                                        type="date"
                                        value={accessForm.startDate}
                                        onChange={(e) => setAccessForm(prev => ({ ...prev, startDate: e.target.value }))}
                                        className="w-full px-2 py-1 text-xs bg-white border border-gray-200 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-medium text-gray-600 block mb-0.5">End</label>
                                      <input
                                        type="date"
                                        value={accessForm.endDate}
                                        onChange={(e) => setAccessForm(prev => ({ ...prev, endDate: e.target.value }))}
                                        className="w-full px-2 py-1 text-xs bg-white border border-gray-200 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                      <input
                                        type="checkbox"
                                        checked={accessForm.revoked}
                                        onChange={(e) => setAccessForm(prev => ({ ...prev, revoked: e.target.checked }))}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                      />
                                      Revoked
                                    </label>
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                      <input
                                        type="checkbox"
                                        checked={accessForm.enabled}
                                        onChange={(e) => setAccessForm(prev => ({ ...prev, enabled: e.target.checked }))}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                      />
                                      Enabled
                                    </label>
                                  </div>
                                  <div className="flex gap-2 pt-1">
                                    <button
                                      onClick={() => handleSaveEmmaAccessPlan(user.id)}
                                      disabled={processingId === user.id}
                                      className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                    >
                                      {processingId === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                                    </button>
                                    <button
                                      onClick={() => setEditingAccessId(null)}
                                      className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleEditEmmaAccess(user)}
                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                                  >
                                    Edit plan
                                  </button>
                                  <span className="text-gray-300">|</span>
                                  <button
                                    onClick={() => handleToggleUserEmmaAccess(user.id)}
                                    disabled={processingId === user.id}
                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-50"
                                  >
                                    {isUserEmmaAccess ? 'Block' : 'Unblock'}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      <td className="px-6 py-4">
                        {user.approved ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                            <Clock className="w-3.5 h-3.5" />
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {user.role !== 'ADMIN' && (
                            <button 
                              onClick={() => handleToggleApproval(user.id)}
                              disabled={processingId === user.id}
                              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-50"
                              title={user.approved ? 'Disapprove' : 'Approve'}
                            >
                              {processingId === user.id ? 
                                <Loader2 className="w-4 h-4 animate-spin" /> : 
                                (user.approved ? <UserMinus className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />)
                              }
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={processingId === user.id}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
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
            <div className="py-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">
                {searchTerm ? `No users found matching "${searchTerm}"` : 'No users to display'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminUserManagement;