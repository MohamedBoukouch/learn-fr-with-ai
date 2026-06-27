import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { API_BASE_URL } from '../../api';
import Layout from '../../components/Layout';
import { Plus, Sparkles, ChevronLeft, Trash2, Edit2, Loader2, BookOpen, X, Image as ImageIcon, Upload, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLevelStyle } from '../../utils/constants';

const AdminLevelDetail = () => {
  const { levelId } = useParams();
  const [level, setLevel] = useState(null);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [aiForm, setAiForm] = useState({ count: 5, guide: '' });
  const [editingDomain, setEditingDomain] = useState(null);
  const [manualForm, setManualForm] = useState({ name: '', imageUrl: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLevelData();
  }, [levelId]);

  const fetchLevelData = async () => {
    try {
      const levelsRes = await api.get('/learning/levels');
      const currentLevel = levelsRes.data.find(l => l.id.toString() === levelId);
      setLevel(currentLevel);
      
      const domainsRes = await api.get(`/learning/levels/${levelId}/domains`);
      setDomains(domainsRes.data);
    } catch (err) {
      console.error('Failed to fetch level data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDomains = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const existingNames = domains.map(d => d.name);
      const response = await api.post('/admin/ai/generate-domains', { 
        level: level.name, 
        count: aiForm.count,
        guide: aiForm.guide,
        existingDomains: existingNames
      });
      
      let generated = response.data;
      if (typeof generated === 'string') {
        generated = JSON.parse(generated);
      }
      
      // Filter out duplicates just in case AI ignores the instruction
      const uniqueGenerated = generated.filter(g => 
        !existingNames.some(existing => existing.toLowerCase() === g.name.toLowerCase())
      );

      // Save each unique generated domain
      for (const dom of uniqueGenerated) {
        await api.post(`/admin/levels/${levelId}/domains`, { name: dom.name });
      }
      
      setIsAiModalOpen(false);
      setAiForm({ count: 5, guide: '' });
      fetchLevelData();
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
      let finalImageUrl = manualForm.imageUrl;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadRes = await api.post('/admin/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalImageUrl = uploadRes.data.url;
      }

      const domainData = {
        name: manualForm.name,
        imageUrl: finalImageUrl
      };

      if (editingDomain) {
        await api.put(`/admin/domains/${editingDomain.id}`, domainData);
      } else {
        await api.post(`/admin/levels/${levelId}/domains`, domainData);
      }

      setIsManualModalOpen(false);
      setManualForm({ name: '', imageUrl: '' });
      setSelectedFile(null);
      setPreviewUrl(null);
      setEditingDomain(null);
      fetchLevelData();
    } catch (err) {
      alert('Error saving domain: ' + err.message);
    }
  };

  const handleEditDomain = (domain) => {
    setEditingDomain(domain);
    setManualForm({ name: domain.name, imageUrl: domain.imageUrl || '' });
    setPreviewUrl(domain.imageUrl ? `${API_BASE_URL}${domain.imageUrl}` : null);
    setIsManualModalOpen(true);
  };

  const handleDeleteDomain = async (id) => {
    if (!window.confirm('Are you sure you want to delete this domain? All phrases inside will be lost.')) return;
    try {
      await api.delete(`/admin/domains/${id}`);
      fetchLevelData();
    } catch (err) {
      alert('Error deleting domain');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  if (loading || !level) return <Layout><div className="p-8">Loading...</div></Layout>;

  const style = getLevelStyle(level.name);

  const filteredDomains = domains.filter(domain => 
    domain.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/content')}
              className="p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all text-gray-500"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">Level {level.name}</h1>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${style.badge}`} style={{ backgroundColor: level.color + '20', color: level.color }}>
                  Active Level
                </span>
              </div>
              <p className="text-gray-500">Manage learning domains for this difficulty level.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Search domains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-[250px] font-medium"
              />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsAiModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
              >
                <Sparkles size={20} className="text-yellow-400" />
                AI Generate
              </button>
              <button 
                onClick={() => setIsManualModalOpen(true)}
                className="px-6 py-3 rounded-2xl font-bold flex items-center gap-2 text-white shadow-lg transition-all"
                style={{ backgroundColor: level.color }}
              >
                <Plus size={20} />
                Add Domain
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDomains.map((domain, i) => (
            <motion.div
              key={domain.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all"
            >
              <div className="h-40 bg-gray-50 relative overflow-hidden">
                {domain.imageUrl ? (
                  <img src={`${API_BASE_URL}${domain.imageUrl}`} alt={domain.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-30" style={{ backgroundColor: level.color + '15' }}>
                    <BookOpen size={48} style={{ color: level.color }} />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                   <button 
                     onClick={() => handleEditDomain(domain)}
                     className="p-2 bg-white/90 backdrop-blur text-blue-500 rounded-xl shadow-sm hover:bg-blue-50"
                   >
                     <Edit2 size={16} />
                   </button>
                   <button 
                     onClick={() => handleDeleteDomain(domain.id)}
                     className="p-2 bg-white/90 backdrop-blur text-red-500 rounded-xl shadow-sm hover:bg-red-50"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{domain.name}</h3>
                <Link
                  to={`/admin/content/domains/${domain.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all border-2"
                  style={{ borderColor: level.color + '30', color: level.color }}
                >
                  Manage Phrases
                </Link>
              </div>
            </motion.div>
          ))}
          {filteredDomains.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 text-gray-400">
               {searchTerm ? `No domains matching "${searchTerm}"` : 'No domains yet. Click "AI Generate" or "Add Domain" to begin.'}
            </div>
          )}
        </div>
      </div>

      {/* AI Generation Modal */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAiModalOpen(false)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <Sparkles className="text-yellow-500" /> AI Domain Generator
                </h2>
                <button onClick={() => setIsAiModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20}/></button>
              </div>

              <form onSubmit={handleGenerateDomains} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2">Level Context</label>
                  <div className="p-4 bg-gray-50 rounded-2xl font-bold border border-gray-100 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: level.color }} />
                    Level {level.name}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2">Number of Domains</label>
                  <input 
                    type="number" 
                    min="1" max="10"
                    value={aiForm.count}
                    onChange={(e) => setAiForm({...aiForm, count: parseInt(e.target.value)})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2">Custom Guidance (Optional)</label>
                  <textarea 
                    placeholder="e.g. Focus on professional themes or daily life in Morocco..."
                    value={aiForm.guide}
                    onChange={(e) => setAiForm({...aiForm, guide: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-medium focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={generating}
                  className="w-full bg-gray-900 text-white py-5 rounded-[1.5rem] font-black hover:bg-gray-800 transition-all flex items-center justify-center gap-3 shadow-xl disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {generating ? <Loader2 className="animate-spin" /> : <Sparkles className="text-yellow-400" />}
                  {generating ? 'Generating Pack...' : 'Generate Domains'}
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
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black">{editingDomain ? 'Edit Domain' : 'New Domain'}</h2>
                <button 
                  onClick={() => {
                    setIsManualModalOpen(false);
                    setEditingDomain(null);
                    setManualForm({ name: '', imageUrl: '' });
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }} 
                  className="p-2 hover:bg-gray-100 rounded-xl"
                >
                  <X size={20}/>
                </button>
              </div>

              <form onSubmit={handleManualAdd} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2">Domain Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. À l'aéroport"
                    value={manualForm.name}
                    onChange={(e) => setManualForm({...manualForm, name: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase mb-2">Thumbnail Image</label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                      {previewUrl ? (
                        <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <ImageIcon className="text-gray-300" size={32} />
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-2 font-medium">Upload a picture for this domain</p>
                      <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition-all text-sm font-bold w-fit">
                        <Upload size={16} />
                        Choose File
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      </label>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full text-white py-5 rounded-[1.5rem] font-black hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl"
                  style={{ backgroundColor: level.color }}
                >
                  {editingDomain ? <Edit2 size={20} /> : <Plus size={20} />}
                  {editingDomain ? 'Update Domain' : 'Create Domain'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default AdminLevelDetail;
