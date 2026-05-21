import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import Layout from '../../components/Layout';
import { Plus, Sparkles, ChevronLeft, Trash2, Edit2, Loader2, Save, Trash, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLevelStyle } from '../../utils/constants';

const AdminDomainDetail = () => {
  const { domainId } = useParams();
  const [domain, setDomain] = useState(null);
  const [level, setLevel] = useState(null);
  const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [aiForm, setAiForm] = useState({ count: 10, guide: '' });
  const [editingPhrase, setEditingPhrase] = useState(null);
  const [manualForm, setManualForm] = useState({ 
    frenchText: '', 
    arabicTranslation: '', 
    vocabularyList: [{ frenchWord: '', arabicMeaning: '' }] 
  });
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDomainData();
  }, [domainId]);

  const fetchDomainData = async () => {
    try {
      // Find domain and its level
      const levelsRes = await api.get('/learning/levels');
      let foundDomain = null;
      let foundLevel = null;
      
      for (const l of levelsRes.data) {
        const dom = l.domains?.find(d => d.id.toString() === domainId);
        if (dom) {
          foundDomain = dom;
          foundLevel = l;
          break;
        }
      }
      
      setDomain(foundDomain);
      setLevel(foundLevel);
      
      const phrasesRes = await api.get(`/learning/domains/${domainId}/phrases`);
      setPhrases(phrasesRes.data);
    } catch (err) {
      console.error('Failed to fetch domain data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePhrases = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setAiPreview(null);
    try {
      const existingTexts = phrases.map(p => p.frenchText);
      const response = await api.post('/admin/ai/generate-phrases', { 
        domain: domain.name, 
        level: level.name,
        count: aiForm.count,
        guide: aiForm.guide,
        existingPhrases: existingTexts
      });
      
      let generated = response.data;
      if (typeof generated === 'string') {
        generated = JSON.parse(generated);
      }
      
      // Filter duplicates
      const unique = generated.filter(g => 
        !existingTexts.some(ex => ex.toLowerCase() === g.frenchText.toLowerCase())
      );
      
      setAiPreview(unique);
      setIsAiModalOpen(false);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      alert('Generation error: ' + errorMsg);
    } finally {
      setGenerating(false);
    }
  };

  const handleManualAdd = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...manualForm,
        vocabularyList: manualForm.vocabularyList.filter(v => v.frenchWord.trim())
      };

      if (editingPhrase) {
        await api.put(`/admin/phrases/${editingPhrase.id}`, payload);
      } else {
        const nextIndex = phrases.length > 0 
          ? Math.max(...phrases.map(p => p.orderIndex)) + 1 
          : 0;
        payload.orderIndex = nextIndex;
        await api.post(`/admin/domains/${domainId}/phrases`, payload);
      }
      
      setIsManualModalOpen(false);
      setEditingPhrase(null);
      setManualForm({ 
        frenchText: '', 
        arabicTranslation: '', 
        vocabularyList: [{ frenchWord: '', arabicMeaning: '' }] 
      });
      fetchDomainData();
    } catch (err) {
      alert('Error saving phrase');
    }
  };

  const openEditModal = (phrase) => {
    setEditingPhrase(phrase);
    setManualForm({
      frenchText: phrase.frenchText,
      arabicTranslation: phrase.arabicTranslation,
      vocabularyList: phrase.vocabularyList && phrase.vocabularyList.length > 0 
        ? phrase.vocabularyList 
        : [{ frenchWord: '', arabicMeaning: '' }]
    });
    setIsManualModalOpen(true);
  };

  const handleAddVocabRow = () => {
    setManualForm({
      ...manualForm,
      vocabularyList: [...manualForm.vocabularyList, { frenchWord: '', arabicMeaning: '' }]
    });
  };

  const handleRemoveVocabRow = (index) => {
    const newList = manualForm.vocabularyList.filter((_, i) => i !== index);
    setManualForm({
      ...manualForm,
      vocabularyList: newList.length > 0 ? newList : [{ frenchWord: '', arabicMeaning: '' }]
    });
  };

  const handleVocabChange = (index, field, value) => {
    const newList = [...manualForm.vocabularyList];
    newList[index][field] = value;
    setManualForm({ ...manualForm, vocabularyList: newList });
  };

  const handleRemoveFromAiPreview = (index) => {
    setAiPreview(aiPreview.filter((_, i) => i !== index));
  };

  const saveAiContent = async () => {
    setSaving(true);
    try {
      await api.post(`/admin/domains/${domainId}/phrases/bulk`, { phrases: aiPreview });
      setAiPreview(null);
      fetchDomainData();
    } catch (err) {
      alert('Error saving content');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePhrase = async (id) => {
    if (window.confirm('Delete this phrase?')) {
      await api.delete(`/admin/phrases/${id}`);
      fetchDomainData();
    }
  };

  if (loading || !domain) return <Layout><div className="p-8">Loading...</div></Layout>;

  const style = getLevelStyle(level.name);

  return (
    <Layout>
      <div className="space-y-8 pb-20">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/admin/content/levels/${level.id}`)}
              className="p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all text-gray-500"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{domain.name}</h1>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${style.badge}`}>
                  Level {level.name}
                </span>
              </div>
              <p className="text-gray-500">Manage interactive phrases and vocabulary.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
            >
              <Sparkles size={20} className="text-yellow-400" />
              AI Boost
            </button>
            <button 
              onClick={() => setIsManualModalOpen(true)}
              className={`${style.button} text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-all`}
            >
              <Plus size={20} />
              Add Phrase
            </button>
          </div>
        </header>

        <AnimatePresence>
          {aiPreview && (
            <motion.section 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-200 border border-indigo-800"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black flex items-center gap-3">
                    <Sparkles className="text-yellow-400" />
                    AI Generated Phrases
                  </h2>
                  <p className="text-indigo-300">Review the generated content before saving to database.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setAiPreview(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                    <X size={20} />
                  </button>
                  <button 
                    onClick={saveAiContent}
                    disabled={saving}
                    className="flex items-center gap-2 bg-white text-indigo-900 px-8 py-3 rounded-2xl font-black hover:bg-yellow-400 transition-all shadow-xl"
                  >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Save All to Live
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-auto pr-2">
                {aiPreview.map((p, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl relative group/item">
                    <button 
                      onClick={() => handleRemoveFromAiPreview(i)}
                      className="absolute top-4 right-4 p-2 bg-red-500/20 hover:bg-red-500 text-red-200 rounded-lg opacity-0 group-hover/item:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                    <p className="font-bold text-lg pr-8">{p.frenchText}</p>
                    <p className="text-indigo-300 text-sm mt-1 mb-3">{p.arabicTranslation}</p>
                    <div className="flex flex-wrap gap-2">
                      {p.vocabularyList?.map((v, vi) => (
                        <span key={vi} className="text-[10px] bg-indigo-800 px-2 py-1 rounded">
                          {v.frenchWord}: {v.arabicMeaning}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Order</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Phrase (French)</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Translation (Arabic)</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {phrases.map((phrase) => (
                <tr key={phrase.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6 font-mono text-gray-300">#{phrase.orderIndex}</td>
                  <td className="px-8 py-6 font-bold text-gray-900">{phrase.frenchText}</td>
                  <td className="px-8 py-6 text-gray-500 font-medium">{phrase.arabicTranslation}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 transition-opacity">
                      <button 
                        onClick={() => openEditModal(phrase)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeletePhrase(phrase.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {phrases.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center text-gray-400 italic">
                    No phrases found for this domain. Use the AI generator to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>

      {/* AI Generation Modal */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAiModalOpen(false)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <Sparkles className="text-yellow-500" /> AI Phrase Generator
                </h2>
                <button onClick={() => setIsAiModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20}/></button>
              </div>

              <form onSubmit={handleGeneratePhrases} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2">Target Count</label>
                  <input 
                    type="number" 
                    min="1" max="20"
                    value={aiForm.count}
                    onChange={(e) => setAiForm({...aiForm, count: parseInt(e.target.value)})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2">Context Guidance</label>
                  <textarea 
                    placeholder="e.g. Focus on questions and answers, or use specific vocabulary like 'train', 'ticket'..."
                    value={aiForm.guide}
                    onChange={(e) => setAiForm({...aiForm, guide: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={generating}
                  className="w-full bg-gray-900 text-white py-5 rounded-[1.5rem] font-black hover:bg-gray-800 transition-all flex items-center justify-center gap-3 shadow-xl disabled:bg-gray-100"
                >
                  {generating ? <Loader2 className="animate-spin" /> : <Sparkles className="text-yellow-400" />}
                  {generating ? 'Generating Content...' : 'Generate Phrases'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Add Modal */}
      <AnimatePresence>
        {isManualModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsManualModalOpen(false)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-2xl bg-white rounded-[2.5rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black">{editingPhrase ? 'Edit Phrase' : 'Add New Phrase'}</h2>
                  <p className="text-gray-400 text-sm">Level {level.name} • {domain.name}</p>
                </div>
                <button onClick={() => { setIsManualModalOpen(false); setEditingPhrase(null); }} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20}/></button>
              </div>

              <form onSubmit={handleManualAdd} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2">French Text</label>
                    <textarea 
                      required
                      placeholder="e.g. Où est la gare ?"
                      value={manualForm.frenchText}
                      onChange={(e) => setManualForm({...manualForm, frenchText: e.target.value})}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 h-24"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2">Arabic Translation</label>
                    <textarea 
                      required
                      placeholder="e.g. أين هي المحطة؟"
                      value={manualForm.arabicTranslation}
                      onChange={(e) => setManualForm({...manualForm, arabicTranslation: e.target.value})}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 h-24 text-right"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-xs font-black text-gray-400 uppercase">Vocabulary Keywords</label>
                    <button 
                      type="button" 
                      onClick={handleAddVocabRow}
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Word
                    </button>
                  </div>
                  <div className="space-y-3">
                    {manualForm.vocabularyList.map((vocab, idx) => (
                      <div key={idx} className="flex gap-3 group/vocab">
                        <input 
                          placeholder="French Word"
                          value={vocab.frenchWord}
                          onChange={(e) => handleVocabChange(idx, 'frenchWord', e.target.value)}
                          className="flex-1 p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input 
                          placeholder="Arabic Meaning"
                          value={vocab.arabicMeaning}
                          onChange={(e) => handleVocabChange(idx, 'arabicMeaning', e.target.value)}
                          className="flex-1 p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500 text-right"
                        />
                        <button 
                          type="button"
                          onClick={() => handleRemoveVocabRow(idx)}
                          className="p-3 text-red-300 hover:text-red-500 transition-colors opacity-0 group-hover/vocab:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full text-white py-5 rounded-[1.5rem] font-black hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl"
                  style={{ backgroundColor: level.color }}
                >
                  <Save size={20} />
                  Save Phrase
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default AdminDomainDetail;
