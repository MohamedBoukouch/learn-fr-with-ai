import React, { useEffect, useState } from 'react';
import api from '../api';
import Layout from '../components/Layout';
import { 
  UserCheck, UserX, Sparkles, Plus, Loader2, BookOpen, Save, Trash2, 
  ChevronRight, Eye, Users, Clock, TrendingUp, BarChart3 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line 
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [levels, setLevels] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'content'
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, levelsRes, statsRes] = await Promise.all([
        api.get('/admin/users/pending'),
        api.get('/learning/levels'),
        api.get('/tracking/stats')
      ]);
      setPendingUsers(usersRes.data);
      setLevels(levelsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    await api.post(`/admin/users/${id}/approve`);
    fetchData();
  };

  const handleReject = async (id) => {
    await api.post(`/admin/users/${id}/reject`);
    fetchData();
  };

  const generateAIContent = async () => {
    if (!selectedDomain) return;
    setGenerating(true);
    setAiResult(null);
    try {
      const response = await api.get('/admin/ai/generate-phrases', { 
        params: { 
          domain: selectedDomain.name, 
          level: selectedDomain.levelName 
        } 
      });
      setAiResult(JSON.parse(response.data));
    } catch (err) {
      alert('Erreur: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const saveToDatabase = async () => {
    if (!aiResult || !selectedDomain) return;
    setSaving(true);
    try {
      await api.post(`/admin/domains/${selectedDomain.id}/phrases/bulk`, aiResult);
      setSuccessMsg('Contenu enregistré avec succès !');
      setAiResult(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const formatDuration = (str) => str || '0s';

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8 px-4 pb-20">
        {/* Header */}
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              E-Formation <span className="text-blue-600">Admin</span>
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Centre de contrôle et gestion pédagogique.</p>
          </div>
          {successMsg && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-100 text-green-700 px-6 py-3 rounded-2xl font-bold border border-green-200">
              {successMsg}
            </motion.div>
          )}
        </header>

        {/* Tabs */}
        <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'stats' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 size={18} />
            Statistiques
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'content' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Sparkles size={18} />
            Contenu IA
          </button>
        </div>

        {/* ==================== TAB STATISTIQUES ==================== */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            {/* Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<Eye className="w-7 h-7" />} title="Visites (30j)" value={stats.visits30Days} subtitle={`${stats.visitsToday} aujourd'hui`} color="blue" />
              <StatCard icon={<Users className="w-7 h-7" />} title="Visiteurs Uniques" value={stats.uniqueVisitors30d} subtitle={`${stats.uniqueUsers30d} connectés`} color="green" />
              <StatCard icon={<Clock className="w-7 h-7" />} title="Temps Moyen" value={formatDuration(stats.avgDurationFormatted)} subtitle={`Total: ${formatDuration(stats.totalDurationFormatted)}`} color="orange" />
              <StatCard icon={<TrendingUp className="w-7 h-7" />} title="Visites/Jour" value={Math.round(stats.visits30Days / 30)} subtitle="Moyenne quotidienne" color="purple" />
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Visites par jour */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="font-bold text-gray-700 mb-4">📅 Visites par Jour</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={stats.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tickFormatter={(d) => d?.substring(5)} fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="visits" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Visiteurs uniques */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="font-bold text-gray-700 mb-4">👥 Visiteurs Uniques</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={stats.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tickFormatter={(d) => d?.substring(5)} fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Line type="monotone" dataKey="uniqueSessions" stroke="#10B981" strokeWidth={2} dot={false} name="Sessions" />
                    <Line type="monotone" dataKey="uniqueUsers" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Connectés" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Camemberts + Top Pages */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Type visiteurs */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="font-bold text-gray-700 mb-4 text-center">👥 Type de Visiteurs</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Anonymes', value: stats.visitsAnonymous30d },
                        { name: 'Connectés', value: stats.visitsAuthenticated30d }
                      ]}
                      cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value"
                    >
                      <Cell fill="#F59E0B" />
                      <Cell fill="#3B82F6" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Appareils */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="font-bold text-gray-700 mb-4 text-center">📱 Appareils</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={Object.entries(stats.devices || {}).map(([name, value]) => ({ name, value }))}
                      cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value"
                    >
                      {Object.entries(stats.devices || {}).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Top Pages */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="font-bold text-gray-700 mb-4">🌐 Pages Populaires</h3>
                <div className="space-y-3">
                  {stats.topPages?.slice(0, 6).map((page, i) => {
                    const max = stats.topPages[0]?.count || 1;
                    const width = (page.count / max) * 100;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 truncate">{page.page}</span>
                          <span className="font-bold text-gray-800">{page.count}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB CONTENU IA ==================== */}
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Users + Structure */}
            <div className="space-y-8">
              {/* Approbations */}
              <section className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-xl"><UserCheck className="text-blue-600" size={20} /></div>
                  Approbations
                </h2>
                <div className="space-y-3">
                  {pendingUsers.length === 0 ? (
                    <p className="text-gray-400 italic text-center py-4">Tout est à jour.</p>
                  ) : (
                    pendingUsers.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all">
                        <div className="overflow-hidden">
                          <p className="font-bold truncate">{user.name}</p>
                          <p className="text-[10px] text-gray-400 truncate uppercase tracking-wider">{user.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(user.id)} className="p-2 bg-white text-green-600 rounded-xl shadow-sm hover:shadow-md transition-all">
                            <UserCheck size={16} />
                          </button>
                          <button onClick={() => handleReject(user.id)} className="p-2 bg-white text-red-500 rounded-xl shadow-sm hover:shadow-md transition-all">
                            <UserX size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Domaines */}
              <section className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-xl"><BookOpen className="text-indigo-600" size={20} /></div>
                  Sujets d'étude
                </h2>
                <div className="space-y-6">
                  {levels.map(level => (
                    <div key={level.id}>
                      <p className="text-xs font-black text-gray-300 uppercase tracking-widest mb-3 px-2">{level.name}</p>
                      <div className="grid grid-cols-1 gap-2">
                        {level.domains?.map(domain => (
                          <button
                            key={domain.id}
                            onClick={() => setSelectedDomain({ ...domain, levelName: level.name })}
                            className={`flex items-center justify-between p-4 rounded-2xl transition-all border-2 ${
                              selectedDomain?.id === domain.id 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' 
                              : 'bg-white border-gray-50 text-gray-700 hover:border-blue-200'
                            }`}
                          >
                            <span className="font-bold">{domain.name}</span>
                            <ChevronRight size={16} className={selectedDomain?.id === domain.id ? 'text-white' : 'text-gray-300'} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Générateur IA */}
            <div className="xl:col-span-2">
              <section className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[120px] opacity-20 -mr-32 -mt-32"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-black mb-4 flex items-center justify-center md:justify-start gap-3">
                      <Sparkles className="text-yellow-400" />
                      Générateur Intelligent
                    </h2>
                    <p className="text-gray-400 max-w-md">
                      {selectedDomain 
                        ? `Prêt à générer 10 phrases pour le domaine "${selectedDomain.name}" (${selectedDomain.levelName}).`
                        : "Sélectionnez un sujet à gauche pour commencer à générer du contenu."
                      }
                    </p>
                  </div>
                  
                  <button 
                    onClick={generateAIContent}
                    disabled={generating || !selectedDomain}
                    className={`px-10 py-5 rounded-[2rem] font-black text-lg transition-all flex items-center gap-3 shadow-2xl ${
                      !selectedDomain 
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-white text-gray-900 hover:scale-105 hover:bg-yellow-400'
                    }`}
                  >
                    {generating ? <Loader2 className="animate-spin" /> : <Sparkles size={24} />}
                    Générer le pack
                  </button>
                </div>

                <AnimatePresence>
                  {aiResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="mt-12 space-y-6"
                    >
                      <div className="flex justify-between items-center bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                        <span className="text-yellow-400 font-bold uppercase tracking-widest text-xs">Prévisualisation du contenu</span>
                        <div className="flex gap-3">
                          <button onClick={() => setAiResult(null)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-xl transition-all">
                            <Trash2 size={20} />
                          </button>
                          <button 
                            onClick={saveToDatabase} 
                            disabled={saving}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-900/40 transition-all"
                          >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            Enregistrer
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-auto pr-2">
                        {aiResult.map((phrase, i) => (
                          <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <p className="text-xl font-bold text-white mb-2">{phrase.frenchText}</p>
                                <p className="text-blue-400 font-medium text-lg dir-rtl">{phrase.arabicTranslation}</p>
                              </div>
                              <span className="bg-gray-800 text-gray-500 px-3 py-1 rounded-full text-xs font-mono">{i+1}</span>
                            </div>
                            
                            <div className="mt-4 flex flex-wrap gap-2">
                              {phrase.vocabularyList?.map((v, vi) => (
                                <div key={vi} className="bg-blue-900/30 text-blue-300 px-3 py-1 rounded-lg text-xs border border-blue-800/50">
                                  <span className="font-bold">{v.frenchWord}</span>: {v.arabicMeaning}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Composant pour les cartes de stats
function StatCard({ icon, title, value, subtitle, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <p className="text-sm text-gray-500">{title}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;