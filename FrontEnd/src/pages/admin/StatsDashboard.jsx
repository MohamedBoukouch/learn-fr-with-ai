import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout';
import api from '../../api';
import {
  Eye,
  Users,
  Clock,
  Smartphone,
  Globe,
  TrendingUp,
  UserCheck,
  UserX,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = {
  blue: '#3b82f6',
  green: '#10b981',
  orange: '#f59e0b',
  violet: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
  teal: '#14b8a6',
  red: '#ef4444'
};

const StatsDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tracking/stats');
      setStats(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-600">{error}</div>
        </div>
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-500">No data available</div>
        </div>
      </Layout>
    );
  }

  // Prepare chart data
  const visitsByDayData = stats.visitsByDay?.map(item => ({
    date: formatDate(item.date),
    visits: item.count
  })) || [];

  const sessionsByDayData = stats.sessionsByDay?.map(item => ({
    date: formatDate(item.date),
    sessions: item.count
  })) || [];

  const authData = [
    { name: 'Connectés', value: stats.authenticatedVisits, color: COLORS.blue },
    { name: 'Anonymes', value: stats.anonymousVisits, color: COLORS.green }
  ];

  const deviceData = stats.deviceStats?.map(item => ({
    name: item.deviceType,
    value: item.count,
    color: item.deviceType === 'mobile' ? COLORS.blue : 
           item.deviceType === 'tablet' ? COLORS.violet : COLORS.green
  })) || [];

  const maxPageVisits = Math.max(...(stats.topPages?.map(p => p.count) || [1]));

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Statistiques du Site
            </h1>
            <p className="text-gray-600">
              Vue d'ensemble des visites et de l'engagement des utilisateurs
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Visites 30j */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  30 jours
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.visitsLast30Days?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-500">Visites totales</div>
            </div>

            {/* Visiteurs uniques */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  Uniques
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.uniqueSessions?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-500">Sessions uniques</div>
            </div>

            {/* Temps moyen */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                  Moyenne
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {formatDuration(Math.round(stats.averageDuration || 0))}
              </div>
              <div className="text-sm text-gray-500">Temps par visite</div>
            </div>

            {/* Visites/jour */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-violet-600" />
                </div>
                <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-1 rounded-full">
                  Journalier
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {Math.round(stats.visitsLast30Days / 30 || 0)}
              </div>
              <div className="text-sm text-gray-500">Visites par jour</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Visites par jour */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Visites par jour</h3>
                  <p className="text-sm text-gray-500">30 derniers jours</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={visitsByDayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="visits" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Sessions uniques par jour */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Sessions uniques</h3>
                  <p className="text-sm text-gray-500">30 derniers jours</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sessionsByDayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke={COLORS.green} 
                    strokeWidth={2}
                    dot={{ fill: COLORS.green, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Anonymes vs Connectés */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Type de visiteurs</h3>
                  <p className="text-sm text-gray-500">Connectés vs Anonymes</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie
                      data={authData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {authData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-600">Connectés</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats.authenticatedVisits?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600">Anonymes</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats.anonymousVisits?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Appareils */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Appareils utilisés</h3>
                  <p className="text-sm text-gray-500">Mobile, Desktop, Tablette</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {deviceData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-600 capitalize">{item.name}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {item.value?.toLocaleString() || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Time Spent Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Temps passé sur le site</h3>
                <p className="text-sm text-gray-500">Statistiques d'engagement</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                <div className="text-sm text-orange-600 font-semibold mb-1">Temps moyen</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatDuration(Math.round(stats.averageDuration || 0))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="text-sm text-blue-600 font-semibold mb-1">Temps moyen (connectés)</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatDuration(Math.round(stats.averageDurationAuthenticated || 0))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div className="text-sm text-green-600 font-semibold mb-1">Temps moyen (anonymes)</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatDuration(Math.round(stats.averageDurationAnonymous || 0))}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-500">
                Temps total cumulé : <span className="font-semibold text-gray-900">
                  {formatDuration(stats.totalDuration || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Top Pages */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Pages les plus visitées</h3>
                <p className="text-sm text-gray-500">Top 10 des pages</p>
              </div>
            </div>
            <div className="space-y-4">
              {stats.topPages?.slice(0, 10).map((page, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-bold text-gray-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {page.page}
                      </span>
                      <span className="text-sm text-gray-500">
                        {page.count?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all"
                        style={{ width: `${(page.count / maxPageVisits) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StatsDashboard;
