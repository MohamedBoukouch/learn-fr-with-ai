import React, { useEffect, useState } from 'react';
import api from '../api';
import Layout from '../components/Layout';
import { UserCheck, UserX, Sparkles, Plus, Loader2, BookOpen, Save, Trash2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [levels, setLevels] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, levelsRes] = await Promise.all([
        api.get('/admin/users/pending'),
        api.get('/learning/levels')
      ]);
      setPendingUsers(usersRes.data);
      setLevels(levelsRes.data);
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-12 px-4 pb-20">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">E-Formation <span className="text-blue-600">Admin</span></h1>
            <p className="text-gray-500 mt-2 text-lg">Centre de contrôle et gestion pédagogique.</p>
          </div>
          {successMsg && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-100 text-green-700 px-6 py-3 rounded-2xl font-bold border border-green-200">
              {successMsg}
            </motion.div>
          )}
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Section 1: Users & Structure */}
          <div className="space-y-8">
            {/* User Approvals */}
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

            {/* Structure Selector */}
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

          {/* Section 2: AI Generator & Content Preview */}
          <div className="xl:col-span-2 space-y-8">
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

                    <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700">
                      {aiResult.map((phrase, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <p className="text-xl font-bold text-white mb-2">{phrase.frenchText}</p>
                              <p className="text-blue-400 font-medium dir-rtl text-lg">{phrase.arabicTranslation}</p>
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
      </div>
    </Layout>
  );
};

export default AdminDashboard;
